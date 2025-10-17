"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchDashboardData } from "@/store/dashboardSlice";
import StatCard from "@/components/admin/StatCard";
import ChartCard from "@/components/admin/ChartCard";
import SimpleChart from "@/components/admin/SimpleChart";

const UNIVERSITY_NAME =
  process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Your University";

export default function AdminHomePage() {
  const dispatch = useAppDispatch();
  const {
    stats,
    revenueChart,
    paymentsChart,
    programsChart,
    loading,
    error,
    lastUpdated,
  } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
        <button
          onClick={() => dispatch(fetchDashboardData())}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-red-50 min-h-screen p-6">
      {/* Branded Header */}
      <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-600">
        <div className="flex items-center gap-4">
          <img
            src="/university-logo.png"
            alt={`${UNIVERSITY_NAME} Logo`}
            className="h-12 w-12 rounded bg-white border-2 border-red-600 object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/vercel.svg";
            }}
          />
          <div>
            <h1 className="text-2xl font-bold text-red-600">
              {UNIVERSITY_NAME}
            </h1>
            <p className="text-sm text-blue-600">Admin Payment Portal</p>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-lg border-2 border-blue-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Instructions
        </h2>
        <ul className="mt-3 text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>
            Use the sidebar to navigate: Payments, Programs, Fees, Admins.
          </li>
          <li>
            On Payments, filter by status/date and search by student name or
            email.
          </li>
          <li>
            Export the Rebus report to Excel — export respects current filters.
          </li>
          <li>View, download, or generate receipts for successful payments.</li>
        </ul>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₦${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            change={{
              value: stats.revenueChange,
              type: stats.revenueChange >= 0 ? "increase" : "decrease",
            }}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            }
            description="Total payments received"
          />

          <StatCard
            title="Total Payments"
            value={stats.totalPayments}
            change={{
              value: stats.paymentsChange,
              type: stats.paymentsChange >= 0 ? "increase" : "decrease",
            }}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            description="Completed transactions"
          />

          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            change={{
              value: stats.pendingChange,
              type: stats.pendingChange >= 0 ? "increase" : "decrease",
            }}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            description="Awaiting processing"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue Trend"
          description="Monthly revenue over the last 6 months"
          action={
            <select className="text-sm border-2 border-blue-300 rounded-md px-3 py-1 bg-white text-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
              <option>This year</option>
            </select>
          }
        >
          <SimpleChart data={revenueChart} type="line" />
        </ChartCard>

        <ChartCard
          title="Payment Volume"
          description="Number of payments processed monthly"
          action={
            <select className="text-sm border-2 border-blue-300 rounded-md px-3 py-1 bg-white text-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200">
              <option>Last 6 months</option>
              <option>Last 12 months</option>
              <option>This year</option>
            </select>
          }
        >
          <SimpleChart data={paymentsChart} type="bar" />
        </ChartCard>
      </div>

      {/* Programs Chart */}
      <div className="grid grid-cols-1">
        <ChartCard
          title="Payments by Program"
          description="Distribution of payments across different academic programs"
          action={
            <button className="text-sm text-blue-600 hover:text-red-600 font-medium transition-colors px-3 py-1 rounded-md hover:bg-red-50">
              View Details
            </button>
          }
        >
          <SimpleChart data={programsChart} type="bar" />
        </ChartCard>
      </div>
    </div>
  );
}
