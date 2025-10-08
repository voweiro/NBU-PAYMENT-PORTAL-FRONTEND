"use client";
import { useState } from "react";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type BalanceDetails = {
  payment_id: number;
  transaction_ref: string;
  status: "pending" | "successful" | "failed";
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  percentage_paid: number;
  student_email?: string;
  student_name?: string | null;
  items?: Array<{ fee_id: number; fee_category: string; amount: number }> | null;
};

export default function BalancePaymentPage() {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState<"idle" | "fetching" | "processing">("idle");
  const [details, setDetails] = useState<BalanceDetails | null>(null);

  const fetchDetails = async () => {
    const ref = reference.trim();
    if (!ref) {
      toast.warn("Enter your transaction reference");
      return;
    }
    setLoading("fetching");
    setDetails(null);
    try {
      const res = await fetch(`${API_URL}/payments/balance/by-ref/${encodeURIComponent(ref)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(typeof json.error === "string" ? json.error : "Lookup failed");
        setLoading("idle");
        return;
      }
      setDetails(json.data as BalanceDetails);
      setLoading("idle");
      toast.success("Payment details loaded");
    } catch (err) {
      setLoading("idle");
      toast.error("Unable to fetch payment details");
    }
  };

  const processBalance = async () => {
    if (!details) return;
    if (details.balance_due <= 0) {
      toast.info("Already fully paid");
      return;
    }
    setLoading("processing");
    try {
      const res = await fetch(`${API_URL}/payments/balance/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: details.transaction_ref, amount: details.balance_due }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(typeof json.error === "string" ? json.error : "Balance payment failed");
        setLoading("idle");
        return;
      }
      const updated = json.data as BalanceDetails;
      setDetails((prev) => ({ ...(prev as BalanceDetails), ...updated }));
      setLoading("idle");
      if (updated.status === "successful") {
        toast.success("Balance fully paid. Receipt will be available.");
      } else {
        toast.success("Balance payment recorded");
      }
    } catch (err) {
      toast.error("Unable to process balance payment");
      setLoading("idle");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Balance Payment</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Enter transaction reference"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={fetchDetails}
          disabled={loading !== "idle"}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading === "fetching" ? "Loading..." : "Fetch"}
        </button>
      </div>

      {details && (
        <div className="space-y-3 border rounded p-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Reference</span>
            <span className="font-mono">{details.transaction_ref}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="font-semibold">{details.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-semibold">₦{details.total_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-semibold">₦{details.amount_paid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Balance Due</span>
            <span className="font-semibold">₦{details.balance_due.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Percentage Paid</span>
            <span className="font-semibold">{details.percentage_paid}%</span>
          </div>

          <div className="pt-2">
            <button
              onClick={processBalance}
              disabled={loading !== "idle" || details.balance_due <= 0}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {details.balance_due > 0 ? (loading === "processing" ? "Processing..." : "Pay Balance") : "Fully Paid"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}