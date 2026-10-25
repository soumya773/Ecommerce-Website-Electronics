import React, { useCallback, useEffect, useMemo, useState } from "react";
import SummaryApi from "../common";
import moment from "moment";
import displayINRCurrency from "../helpers/displayCurrency";

const AllOrder = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(SummaryApi.allOrder.url, {
        method: SummaryApi.allOrder.method,
        credentials: "include",
      });

      const responseData = await response.json();

      if (!response.ok || responseData.success === false) {
        throw new Error(responseData.message || "Could not load orders.");
      }

      setData(Array.isArray(responseData.data) ? responseData.data : []);
    } catch (err) {
      setError(err.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.filter((item) => {
      const matchesSearch =
        !query ||
        String(item._id || "")
          .toLowerCase()
          .includes(query) ||
        String(item.email || "")
          .toLowerCase()
          .includes(query) ||
        String(item.userId || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || item.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const handleStatusUpdate = async (orderId, orderStatus) => {
    const confirmed = window.confirm(
      `Change this order status to "${orderStatus}"?`,
    );

    if (!confirmed) return;

    setUpdatingId(orderId);
    setError("");

    try {
      const response = await fetch(SummaryApi.updateOrderStatus.url, {
        method: SummaryApi.updateOrderStatus.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, orderStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not update order status.");
      }

      setData((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: result.data.orderStatus }
            : order,
        ),
      );
    } catch (err) {
      setError(err.message || "Could not update order status.");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-500">Loading orders...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Order Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search orders and manage their status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrderDetails}
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Refresh orders
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order ID, email or user ID"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="All">All statuses</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <p className="text-sm text-slate-500">
        Showing {filteredOrders.length} of {data.length} orders
      </p>

      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
          {data.length === 0
            ? "No orders available."
            : "No orders match your search or selected status."}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    Order ID: {item._id}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {moment(item.createdAt).format("LLL")}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Customer: {item.email || item.userId}
                  </p>
                </div>

                <div className="min-w-48">
                  <label
                    htmlFor={`status-${item._id}`}
                    className="mb-1 block text-sm font-medium"
                  >
                    Order status
                  </label>

                  <select
                    id={`status-${item._id}`}
                    value={item.orderStatus || "Processing"}
                    disabled={updatingId === item._id}
                    onChange={(event) =>
                      handleStatusUpdate(item._id, event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {updatingId === item._id && (
                    <p className="mt-1 text-xs text-slate-500">
                      Updating status...
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {(item.productDetails || []).map((product, index) => (
                  <div
                    key={`${product.productId || product.name}-${index}`}
                    className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3"
                  >
                    <img
                      src={product.image?.[0]}
                      alt={product.name || "Product"}
                      className="h-20 w-20 rounded-md bg-white object-contain p-1"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800">
                        {product.name || "Product"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Quantity: {product.quantity ?? 0}
                      </p>
                    </div>

                    <p className="font-semibold text-slate-800">
                      {displayINRCurrency(product.price || 0)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
                <div>
                  <h2 className="font-semibold">Payment Details</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Method:{" "}
                    {item.paymentDetails?.payment_method_type?.join(", ") ||
                      "Not specified"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Payment status:{" "}
                    {item.paymentDetails?.payment_status || "Unknown"}
                  </p>
                </div>

                <div>
                  <h2 className="font-semibold">Shipping Details</h2>
                  {(item.shipping_options || []).length === 0 ? (
                    <p className="mt-1 text-sm text-slate-500">
                      No shipping details recorded.
                    </p>
                  ) : (
                    item.shipping_options.map((shipping, index) => (
                      <p
                        key={`${shipping.shipping_rate || "shipping"}-${index}`}
                        className="mt-1 text-sm text-slate-600"
                      >
                        Shipping amount:{" "}
                        {displayINRCurrency(shipping.shipping_amount || 0)}
                      </p>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 border-t pt-3 text-right">
                <span className="text-sm text-slate-500">Total amount</span>
                <p className="text-xl font-bold text-slate-900">
                  {displayINRCurrency(item.totalAmount || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrder;
