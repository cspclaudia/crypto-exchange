import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api";
import { Order } from "../types/Order";
import currency from "currency.js";

const BuySellPage: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [actionType, setActionType] = useState<"BUY" | "SELL" | null>(null);
  const [message, setMessage] = useState<React.ReactNode>("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  useEffect(() => {
    if (order) {
      setAmount(currency(order.amountBtc, { precision: 8 }).value.toString());
      setPrice(currency(order.priceUsd).value.toString());
      setActionType(order.type === "SELL" ? "BUY" : "SELL");
    }
  }, [order]);

  const calculateTotal = () => {
    if (!amount || !price) return "";
    return currency(String(Number(amount) * Number(price))).format({
      symbol: "US$ ",
    });
  };

  const confirmCreateOrder = async () => {
    try {
      setLoading(true);
      setMessage("");

      const payload = {
        amountBtc: currency(amount, { precision: 8 }).value,
        priceUsd: currency(price).value,
      };

      const endpoint = actionType === "BUY" ? "/orders/buy" : "/orders/sell";

      await api.post(endpoint, payload);

      setMessage(
        <>
          <i className="bi bi-check-circle"></i>{" "}
          {actionType === "BUY" ? "Buy" : "Sell"} order created successfully!
        </>,
      );

      setAmount("");
      setPrice("");
    } catch (err: any) {
      console.error("Error creating order:", err);

      if (err?.response?.status === 401) {
        setMessage("Session expired. Please login again.");
      } else {
        setMessage(
          <>
            <i className="bi bi-x-circle"></i>{" "}
            {err?.response?.data?.message || "Failed to submit order."}
          </>,
        );
      }
    } finally {
      setShowModal(false);
      setLoading(false);
    }
  };

  const handleClick = (type: "BUY" | "SELL") => {
    setActionType(type);
    setShowModal(true);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      {message && <div className="alert alert-info text-center">{message}</div>}

      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Action</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                Are you sure you want to {actionType === "BUY" ? "buy" : "sell"}{" "}
                BTC?
                <p>
                  <strong>Total:</strong> {calculateTotal()}
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmCreateOrder}
                  disabled={loading}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm rounded-4">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Buy and Sell BTC</h2>

          <div className="mb-3">
            <label className="form-label">Amount (BTC)</label>
            <input
              type="number"
              step="0.0001"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price (USD)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Total (USD)</label>
            <div className="form-control-plaintext fw-semibold">
              {calculateTotal()}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-primary w-50"
              onClick={() => handleClick("BUY")}
            >
              Buy
            </button>
            <button
              className="btn btn-danger w-50"
              onClick={() => handleClick("SELL")}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuySellPage;
