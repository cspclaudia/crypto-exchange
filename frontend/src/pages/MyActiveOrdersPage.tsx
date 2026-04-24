import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Order } from "../types/Order";
import currency from "currency.js";

const MyActiveOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get<Order[]>("/orders/active");
        const data = Array.isArray(res.data) ? res.data : [];
        setOrders(data);
      } catch (err: any) {
        console.error("Error fetching orders:", err);

        if (err?.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Error fetching active orders.");
        }

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const cancelOrder = async (orderId: number) => {
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setError("");
    } catch (err: any) {
      console.error("Error cancelling order:", err);

      if (err?.response?.status === 404) {
        setError("Order not found or invalid endpoint.");
      } else if (err?.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Error cancelling the order.");
      }
    } finally {
      setModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const openConfirmModal = (orderId: number) => {
    setOrderToCancel(orderId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setOrderToCancel(null);
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">My Active Orders</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading active orders...</p>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th>Amount (BTC)</th>
                  <th>Price (USD)</th>
                  <th>Total (USD)</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
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

                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => openConfirmModal(order.id)}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      No active orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Cancellation</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>

              <div className="modal-body">
                <p>Are you sure you want to cancel this order?</p>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Close
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (orderToCancel !== null) cancelOrder(orderToCancel);
                  }}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyActiveOrdersPage;
