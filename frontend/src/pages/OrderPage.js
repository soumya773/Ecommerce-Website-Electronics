import React, { useCallback, useEffect, useState } from "react";
import SummaryApi from "../common";
import moment from "moment";
import displayINRCurrency from "../helpers/displayCurrency";

const OrderPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(SummaryApi.getOrder.url, {
        method: SummaryApi.getOrder.method,
        credentials: "include",
      });

      const responseData = await response.json();

      if (!response.ok || responseData.success === false) {
        throw new Error(responseData.message || "Could not load your orders.");
      }

      setData(Array.isArray(responseData.data) ? responseData.data : []);
    } catch (err) {
      setError(err.message || "Could not load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-slate-50">
      <div className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
            <p className="mt-1 text-sm text-slate-500">
              View your purchases and track their status.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrderDetails}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            Refresh orders
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchOrderDetails}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!error && data.length === 0 && (
          <div className="rounded-xl border bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-800">
              No orders available
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your orders will appear here after checkout.
            </p>
          </div>
        )}

        {data.map((item, index) => {
          const status = item.orderStatus || "Processing";

          const statusStyles = {
            Processing: "bg-amber-100 text-amber-800",
            Shipped: "bg-blue-100 text-blue-800",
            Delivered: "bg-green-100 text-green-800",
            Cancelled: "bg-red-100 text-red-800",
          };

          return (
            <article
              key={item._id || `${item.userId}-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                <div>
                  <p className="font-semibold text-slate-800">Order placed</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.createdAt
                      ? moment(item.createdAt).format("LLL")
                      : "Date unavailable"}
                  </p>
                  {item._id && (
                    <p className="mt-1 break-all text-xs text-slate-500">
                      Order ID: {item._id}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium text-slate-600">
                    Order status
                  </p>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      statusStyles[status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              <div className="grid gap-5 p-4 lg:grid-cols-[1fr_280px]">
                <div className="space-y-3">
                  {(item.productDetails || []).map((product, productIndex) => (
                    <div
                      key={`${product.productId || product.name || "product"}-${productIndex}`}
                      className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 p-3"
                    >
                      <img
                        src={product.image?.[0]}
                        alt={product.name || "Product"}
                        className="h-24 w-24 rounded-md bg-white object-contain p-2"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-800">
                          {product.name || "Product"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Quantity: {product.quantity ?? 0}
                        </p>
                        <p className="mt-1 font-semibold text-red-500">
                          {displayINRCurrency(product.price || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-5">
                  <div>
                    <h2 className="font-semibold text-slate-800">
                      Payment details
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Method:{" "}
                      {item.paymentDetails?.payment_method_type?.join(", ") ||
                        "Not specified"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Payment status:{" "}
                      {item.paymentDetails?.payment_status || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-800">
                      Shipping details
                    </h2>

                    {!item.shipping_options?.length ? (
                      <p className="mt-2 text-sm text-slate-500">
                        No shipping details recorded.
                      </p>
                    ) : (
                      item.shipping_options.map((shipping, shippingIndex) => (
                        <p
                          key={`${shipping.shipping_rate || "shipping"}-${shippingIndex}`}
                          className="mt-2 text-sm text-slate-600"
                        >
                          Shipping amount:{" "}
                          {displayINRCurrency(shipping.shipping_amount || 0)}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t bg-slate-50 p-4 text-right">
                <p className="text-sm text-slate-500">Total amount</p>
                <p className="text-xl font-bold text-slate-900">
                  {displayINRCurrency(item.totalAmount || 0)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default OrderPage;
