import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Order } from "../types/Order";
import { OrderBook } from "../types/OrderBook";
import currency from "currency.js";
import { useNavigate } from "react-router-dom";

const BidAskPage: React.FC = () => {
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderBook = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/orders/bid-ask");
        const data = {
          bids: res.data?.bids ?? [],
          asks: res.data?.asks ?? [],
        };
        setOrderBook(data);
      } catch (err: any) {
        console.error("Error loading order book:", err);

        if (err?.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Error loading order book.");
        }

        setOrderBook({ bids: [], asks: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBook();
  }, []);

  const handleRowClick = (order: Order) => {
    navigate("/buy-sell", {
      state: { order },
    });
  };

  const renderRows = (orders: Order[]) => {
    return orders.length > 0 ? (
      orders.map((order, idx) => (
        <tr
          key={idx}
          style={{
            cursor: "pointer",
            backgroundColor:
              order.type === "BUY"
                ? "rgba(40,167,69,0.08)"
                : "rgba(220,53,69,0.08)",
          }}
          onClick={() => handleRowClick(order)}
        >
          <td>{order.type}</td>
          <td>
            {currency(order.amountBtc, { precision: 8 }).format({
              symbol: "",
            })}
          </td>
          <td>
            {currency(order.priceUsd).format({
              symbol: "US$ ",
            })}
          </td>
          <td>
            {currency(order.amountBtc * order.priceUsd).format({
              symbol: "US$ ",
            })}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={4} className="text-center text-muted">
          Empty
        </td>
      </tr>
    );
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Order Book</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="row">
          <div className="col-md-6">
            <h4 className="text-success">Bids (Buy)</h4>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Volume (BTC)</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>{renderRows(orderBook.bids)}</tbody>
            </table>
          </div>

          <div className="col-md-6">
            <h4 className="text-danger">Asks (Sell)</h4>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Volume (BTC)</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>{renderRows(orderBook.asks)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidAskPage;
