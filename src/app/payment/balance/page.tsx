"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import Header from "@/components/Header";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* University Header */}
      <Header currentPage="payment" />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Balance Payment</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Look up your transaction and settle any outstanding balance.</p>
        </div>

        {/* How it works */}
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200 mb-2">How balance payment works</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-amber-900/90 dark:text-amber-200/90">
            <li>Enter your original transaction reference and click Fetch.</li>
            <li>Review the summary: amount paid, balance due, and fees.</li>
            <li>If there’s a balance, enter your 11‑digit phone number for GlobalPay.</li>
            <li>Click Pay Balance to continue to the secure gateway.</li>
            <li>After successful payment, your receipt will show “Balance Settlement”.</li>
          </ol>
        </div>

        {/* Lookup Form */}
        <div className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
          <label className="block text-xs font-medium mb-2">Transaction Reference</label>
          <div className="flex gap-2">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter transaction reference"
              className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
            />
            <button
              onClick={fetchDetails}
              disabled={loading !== "idle"}
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50"
            >
              {loading === "fetching" ? "Loading..." : "Fetch"}
            </button>
          </div>
        </div>

        {/* Details & Actions */}
        {details && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reference</span>
                  <span className="font-mono text-sm">{details.transaction_ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className="font-semibold">{details.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                  <span className="font-semibold">₦{details.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount Paid</span>
                  <span className="font-semibold">₦{details.amount_paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Balance Due</span>
                  <span className="font-semibold">₦{details.balance_due.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Percentage Paid</span>
                  <span className="font-semibold">{Math.round(details.percentage_paid)}%</span>
                </div>
              </div>

              {/* Items (if multi-fee) */}
              {Array.isArray(details.items) && details.items?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Fees Included</p>
                  <div className="flex flex-wrap gap-2">
                    {details.items.map((it, idx) => (
                      <span key={`${it.fee_id}-${idx}`} className="text-xs px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        {it.fee_category} — ₦{Number(it.amount).toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
              <label className="block text-xs font-medium mb-2">Phone Number (GlobalPay requires 11 digits)</label>
              <div className="flex gap-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
                />
                <button
                  onClick={initiateBalance}
                  disabled={loading !== "idle"}
                  className="px-4 py-2 text-sm rounded-md bg-green-600 text-white disabled:opacity-50"
                >
                  {loading === "processing" ? "Redirecting..." : "Pay Balance"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}