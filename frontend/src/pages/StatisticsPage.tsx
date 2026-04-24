import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Statistics } from "../types/Statistics";
import currency from "currency.js";

const StatisticsPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/statistics");
        const data = res.data && typeof res.data === "object" ? res.data : null;
        setStatistics(data);
      } catch (err: any) {
        console.error("Error loading statistics:", err);

        if (err.response.status === 401) {
          setError("Session expired. Please login again.");
        } else {
          setError("Error loading statistics.");
        }

        setStatistics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const formatUsd = (value: number | null | undefined) =>
    value != null && !isNaN(value)
      ? currency(value).format({ symbol: "US$ " })
      : "--";

  const formatBtc = (value: number | null | undefined) =>
    value != null && !isNaN(value)
      ? currency(value, { precision: 8 }).format({ symbol: "" })
      : "--";

  const renderContent = () => {
    if (loading)
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" />
        </div>
      );

    if (error) return <Alert type="danger" message={error} />;
    if (!statistics)
      return <Alert type="warning" message="Statistics not available." />;

    return (
      <div className="card shadow-sm rounded-4">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Statistics</h2>
          <div className="row gy-3">
            <StatisticsItem
              icon="bi-bar-chart-line"
              label="Last Price"
              value={formatUsd(statistics.lastPrice)}
            />
            <StatisticsItem
              icon="bi-currency-bitcoin"
              label="BTC Volume (24h)"
              value={`${formatBtc(statistics.volumeBtc24h)} BTC`}
            />
            <StatisticsItem
              icon="bi-currency-dollar"
              label="USD Volume (24h)"
              value={formatUsd(statistics.volumeUsd24h)}
            />
            <StatisticsItem
              icon="bi-arrow-up-circle"
              label="High (24h)"
              value={formatUsd(statistics.high24h)}
            />
            <StatisticsItem
              icon="bi-arrow-down-circle"
              label="Low (24h)"
              value={formatUsd(statistics.low24h)}
            />
            <StatisticsItem
              icon="bi-wallet2"
              label="Your USD Balance"
              value={formatUsd(statistics.userUsdBalance)}
              valueClass="text-success fw-semibold"
            />
            <StatisticsItem
              icon="bi-wallet"
              label="Your BTC Balance"
              value={formatBtc(statistics.userBtcBalance)}
              valueClass="text-warning fw-semibold"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 500 }}>
      {renderContent()}
    </div>
  );
};

const Alert: React.FC<{ type: "danger" | "warning"; message: string }> = ({
  type,
  message,
}) => <div className={`alert alert-${type} text-center`}>{message}</div>;

interface StatisticsItemProps {
  icon: string;
  label: string;
  value: string | number;
  valueClass?: string;
}

const StatisticsItem: React.FC<StatisticsItemProps> = ({
  icon,
  label,
  value,
  valueClass,
}) => (
  <div className="col-12 d-flex align-items-center justify-content-between border-bottom pb-2">
    <div className="d-flex align-items-center gap-2">
      <i className={`bi ${icon} fs-4 text-primary`} />
      <span className="fw-semibold">{label}:</span>
    </div>
    <div className={valueClass ?? ""}>{value}</div>
  </div>
);

export default StatisticsPage;
