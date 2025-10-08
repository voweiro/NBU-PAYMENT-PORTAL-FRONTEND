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
  const [phone, setPhone] = useState("");

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
      const data = json.data as BalanceDetails & { phone_number?: string | null };
      setDetails(data);
      if (data?.phone_number) {
        setPhone(String(data.phone_number));
      }
      setLoading("idle");
      toast.success("Payment details loaded");
    } catch (err) {
      setLoading("idle");
      toast.error("Unable to fetch payment details");
    }
  };

  const initiateBalance = async () => {
    if (!details) return;
    if (details.balance_due <= 0) {
      toast.info("Already fully paid");
      return;
    }
    if (!/^\d{11}$/.test(phone)) {
      toast.error("Enter a valid 11-digit phone number");
      return;
    }
    setLoading("processing");
    try {
      const res = await fetch(`${API_URL}/payments/balance/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: details.transaction_ref, gateway: "global", phoneNumber: phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(typeof json.error === "string" ? json.error : "Failed to initiate balance payment");
        setLoading("idle");
        return;
      }
      const url: string | undefined = json.data?.authorization_url ?? json.data?.link;
      if (!url) {
        toast.error("Payment gateway did not return a redirect URL");
        setLoading("idle");
        return;
      }
      toast.success("Redirecting to payment gateway...");
      window.location.href = url;
    } catch (err) {
      toast.error("Unable to initiate balance payment");
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
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter 11-digit phone number"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="pt-2">
              <button
                onClick={initiateBalance}
                disabled={loading !== "idle" || details.balance_due <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
              >
              {details.balance_due > 0 ? (loading === "processing" ? "Redirecting..." : "Pay Balance") : "Fully Paid"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}