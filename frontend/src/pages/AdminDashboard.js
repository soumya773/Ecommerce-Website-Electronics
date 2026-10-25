import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SummaryApi from "../common";
import displayINRCurrency from "../helpers/displayCurrency";

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
      {value}
    </p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(SummaryApi.adminDashboardStats.url, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load dashboard.");
      }

      setStats(result.data);
    } catch (err) {
      setError(err.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-8 text-slate-500">
        Loading store overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        <p>{error}</p>
        <button
          onClick={load}
          className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const totals = stats?.totals || {};
  const status = stats?.statusCounts || {};

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-indigo-600">
            Store management
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            A live overview of your store data.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Refresh data
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total revenue"
          value={displayINRCurrency(totals.revenue || 0)}
          hint="Paid orders, excluding cancelled orders"
        />
        <StatCard
          label="Orders"
          value={totals.orders ?? 0}
          hint="All recorded orders"
        />
        <StatCard
          label="Products"
          value={totals.products ?? 0}
          hint="Products in the catalogue"
        />
        <StatCard
          label="Customers & users"
          value={totals.users ?? 0}
          hint="Registered accounts"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent orders</h2>
            <Link
              className="text-sm font-semibold text-indigo-600 hover:underline"
              to="all-orders"
            >
              Manage orders →
            </Link>
          </div>

          {!stats?.recentOrders?.length ? (
            <p className="rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
              No orders yet. Orders will appear here after checkout orders are
              recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">
                      {order.email || "Customer email unavailable"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      {displayINRCurrency(order.totalAmount || 0)}
                    </p>
                    <span className="text-xs text-slate-500">
                      {order.orderStatus} ·{" "}
                      {order.paymentDetails?.payment_status ||
                        "unknown payment"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Order pipeline</h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            Current order status breakdown
          </p>

          <div className="space-y-4">
            {["Processing", "Shipped", "Delivered", "Cancelled"].map(
              (label) => {
                const count = status[label] || 0;
                const total = Math.max(totals.orders || 0, 1);

                return (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {label}
                      </span>
                      <span className="text-slate-500">{count}</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{
                          width: `${Math.min(100, (count / total) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>

          <Link
            to="all-products"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Manage catalogue →
          </Link>
        </div>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Revenue is calculated from recorded paid orders and is an operational
        estimate, not an accounting report. QR/UPI orders are included only if
        they are saved with a paid payment status.
      </p>
    </section>
  );
}
