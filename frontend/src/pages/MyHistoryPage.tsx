import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Order } from "../types/Order";
import currency from "currency.js";

const MyHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get<Order[]>("/orders/history");
        const data = Array.isArray(res.data) ? res.data : [];
        setHistory(data);
      } catch (err: any) {
        console.error("Error loading order history:", err);

        if (err?.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Error loading order history.");
        }

        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">My Order History</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading history...</p>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th>Volume (BTC)</th>
                  <th>Price (USD)</th>
                  <th>Total (USD)</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {history.length > 0 ? (
                  history.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>

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

                      <td>{order.type || "--"}</td>

                      <td>
                        {order.createdAt
                          ? new Date(String(order.createdAt)).toLocaleString()
                          : "--"}
                      </td>

                      <td>{order.status || "--"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      No history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHistoryPage;
