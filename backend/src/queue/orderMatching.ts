import { Op, Transaction } from "sequelize";
import Decimal from "decimal.js";
import { sequelize } from "../config/database";
import { Order } from "../models/Order";
import Trade from "../models/Trade";
import User from "../models/User";
import { OrderStatus, OrderType } from "../enums/OrderEnums";

const MAKER_FEE = new Decimal(0.005);
const TAKER_FEE = new Decimal(0.003);

const MIN_AMOUNT = new Decimal("0.00000001");

async function updateBalances(
  transaction: Transaction,
  takerOrder: Order,
  makerOrder: Order,
  tradeAmount: Decimal,
  tradePrice: Decimal,
) {
  const totalUsd = tradeAmount.mul(tradePrice);

  const takerIsBuyer = takerOrder.type === OrderType.BUY;

  const buyerId = takerIsBuyer ? takerOrder.userId : makerOrder.userId;
  const sellerId = takerIsBuyer ? makerOrder.userId : takerOrder.userId;

  const buyer = await User.findByPk(buyerId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  const seller = await User.findByPk(sellerId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!buyer || !seller) throw new Error("User not found");

  const buyerFee = totalUsd.mul(takerIsBuyer ? TAKER_FEE : MAKER_FEE);
  const sellerFee = totalUsd.mul(takerIsBuyer ? MAKER_FEE : TAKER_FEE);

  await buyer.update(
    {
      btc_available: new Decimal(buyer.btc_available)
        .plus(tradeAmount)
        .toNumber(),

      usd_locked: new Decimal(buyer.usd_locked).minus(totalUsd).toNumber(),

      usd_available: new Decimal(buyer.usd_available)
        .minus(buyerFee)
        .toNumber(),
    },
    { transaction },
  );

  await seller.update(
    {
      btc_locked: new Decimal(seller.btc_locked).minus(tradeAmount).toNumber(),

      usd_available: new Decimal(seller.usd_available)
        .plus(totalUsd)
        .minus(sellerFee)
        .toNumber(),
    },
    { transaction },
  );
}

export async function matchOrder(orderId: number) {
  await sequelize.transaction(async (transaction: Transaction) => {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order || order.status !== OrderStatus.OPEN) return;

    const isBuy = order.type === OrderType.BUY;
    let remaining = new Decimal(order.amountBtc);

    while (remaining.gt(MIN_AMOUNT)) {
      const opp = await Order.findOne({
        where: {
          type: isBuy ? OrderType.SELL : OrderType.BUY,
          status: OrderStatus.OPEN,
          userId: { [Op.ne]: order.userId },
          ...(isBuy
            ? { priceUsd: { [Op.lte]: order.priceUsd } }
            : { priceUsd: { [Op.gte]: order.priceUsd } }),
        },
        order: [
          ["priceUsd", isBuy ? "ASC" : "DESC"],
          ["createdAt", "ASC"],
        ],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!opp) break;

      const oppAmount = new Decimal(opp.amountBtc);
      const tradeAmount = Decimal.min(remaining, oppAmount);

      if (tradeAmount.lte(MIN_AMOUNT)) break;

      const tradePrice = new Decimal(opp.priceUsd);

      await updateBalances(transaction, order, opp, tradeAmount, tradePrice);

      await Trade.create(
        {
          buyOrderId: isBuy ? order.id : opp.id,
          sellOrderId: isBuy ? opp.id : order.id,
          buyUserId: isBuy ? order.userId : opp.userId,
          sellUserId: isBuy ? opp.userId : order.userId,
          amountBtc: tradeAmount.toNumber(),
          priceUsd: tradePrice.toNumber(),
        },
        { transaction },
      );

      remaining = remaining.minus(tradeAmount);
      const newOppAmount = oppAmount.minus(tradeAmount);

      if (newOppAmount.lte(MIN_AMOUNT)) {
        await opp.update({ status: OrderStatus.TRADED }, { transaction });
      } else {
        await opp.update(
          { amountBtc: newOppAmount.toNumber() },
          { transaction },
        );
      }
    }

    if (remaining.lte(MIN_AMOUNT)) {
      await order.update({ status: OrderStatus.TRADED }, { transaction });
    } else {
      await order.update({ amountBtc: remaining.toNumber() }, { transaction });
    }
  });
}
