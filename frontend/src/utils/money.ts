import currency from "currency.js";

export const usd = (value: number | string) =>
  currency(value, {
    symbol: "US$ ",
    precision: 2,
  }).format();

export const btc = (value: number | string) =>
  currency(value, {
    symbol: "",
    precision: 8,
  }).format();
