import React, { useEffect, useState } from "react";
import api from "../api/api";
import currency from "currency.js";

interface User {
  id: number;
  username: string;
}

interface Order {
  id: number;
  user?: User | null;
}

interface Trade {
  id: number;
  buyOrderId: number;
  sellOrderId: number;
  amountBtc: number;
  priceUsd: number;
  createdAt: string;
  buyOrder?: Order | null;
  sellOrder?: Order | null;
}

const GlobalMatchesPage: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get<Trade[]>("/trades");
        const data = Array.isArray(res.data) ? res.data : [];
        setTrades(data);
      } catch (err: any) {
        console.error(
          "Error fetching trades:",
          err.response?.status,
          err.response?.data,
        );

        if (err?.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Error fetching trades.");
        }

        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Latest Matches</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading matches...</p>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Buy Order ID</th>
                  <th>Seller</th>
                  <th>Sell Order ID</th>
                  <th>Volume (BTC)</th>
                  <th>Price (USD)</th>
                  <th>Total (USD)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {trades.length > 0 ? (
                  trades.map((trade) => (
                    <tr key={trade.id}>
                      <td>{trade.buyOrder?.user?.username || "-"}</td>
                      <td>{trade.buyOrder?.id || trade.buyOrderId}</td>
                      <td>{trade.sellOrder?.user?.username || "-"}</td>
                      <td>{trade.sellOrder?.id || trade.sellOrderId}</td>
                      <td>
                        {currency(trade.amountBtc, { precision: 8 }).format({
                          symbol: "",
                        })}
                      </td>
                      <td>
                        {currency(trade.priceUsd).format({
                          symbol: "US$ ",
                        })}
                      </td>
                      <td>
                        {currency(trade.amountBtc * trade.priceUsd).format({
                          symbol: "US$ ",
                        })}
                      </td>
                      <td>
                        {trade.createdAt
                          ? new Date(trade.createdAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      No matches recorded.
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

export default GlobalMatchesPage;
