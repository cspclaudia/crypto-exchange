import { getChannel } from "../config/rabbitmq";

export async function addOrderToQueue(orderId: number) {
  const channel = getChannel();

  await channel.assertQueue("orders", { durable: true });

  channel.sendToQueue("orders", Buffer.from(JSON.stringify({ orderId })), {
    persistent: true,
  });
}
