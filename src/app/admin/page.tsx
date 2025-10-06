'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchDashboardData } from '@/store/dashboardSlice';
import StatCard from '@/components/admin/StatCard';
import ChartCard from '@/components/admin/ChartCard';
import SimpleChart from '@/components/admin/SimpleChart';

const UNIVERSITY_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? 'Your University';

export default function AdminHomePage() {
  const dispatch = useAppDispatch();
  const { stats, revenueChart, paymentsChart, programsChart, loading, error, lastUpdated } = useAppSelector(
    (state) => state.dashboard
  );

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
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Error loading dashboard: {error}</p>
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
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 min-h-screen p-6">
      {/* Branded Header */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-red-600">
        <div className="flex items-center gap-4">
          <img
            src="/university-logo.png"
            alt={`${UNIVERSITY_NAME} Logo`}
            className="h-12 w-12 rounded bg-white dark:bg-neutral-900 border-2 border-red-600 object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vercel.svg'; }}
          />
          <div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">{UNIVERSITY_NAME}</h1>
            <p className="text-sm text-blue-600 dark:text-blue-400">Admin Payment Portal</p>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-neutral-900 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Instructions
        </h2>
        <ul className="mt-3 text-sm text-blue-700 dark:text-blue-300 list-disc pl-5 space-y-1">
          <li>Use the sidebar to navigate: Payments, Programs, Fees, Admins.</li>
          <li>On Payments, filter by status/date and search by student name or email.</li>
          <li>Export the Rebus report to Excel — export respects current filters.</li>
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
               type: stats.revenueChange >= 0 ? 'increase' : 'decrease'
             }}
             icon={
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
               </svg>
             }
             description="Total payments received"
           />
           
           <StatCard
             title="Total Payments"
             value={stats.totalPayments}
             change={{
               value: stats.paymentsChange,
               type: stats.paymentsChange >= 0 ? 'increase' : 'decrease'
             }}
             icon={
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
             }
             description="Completed transactions"
           />
           
           <StatCard
             title="Pending Payments"
             value={stats.pendingPayments}
             change={{
               value: stats.pendingChange,
               type: stats.pendingChange >= 0 ? 'increase' : 'decrease'
             }}
             icon={
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            <select className="text-sm border-2 border-blue-300 dark:border-blue-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200">
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
            <select className="text-sm border-2 border-blue-300 dark:border-blue-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200">
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
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
              View Details
            </button>
          }
        >
          <SimpleChart data={programsChart} type="bar" />
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-blue-200 dark:border-blue-700 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3 shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-red-600 dark:text-red-400">Add New Fee</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Create a new fee category</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/30 dark:hover:to-red-700/30 transition-all duration-200 border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center mr-3 shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-red-600 dark:text-red-400">View Reports</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Generate payment reports</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gradient-to-r from-blue-50 via-white to-red-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-red-900/20 rounded-lg hover:from-blue-100 hover:via-gray-50 hover:to-red-100 dark:hover:from-blue-800/30 dark:hover:via-gray-700 dark:hover:to-red-800/30 transition-all duration-200 border border-blue-200 dark:border-blue-700 hover:border-red-300 dark:hover:border-red-600">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-red-600 to-red-700 rounded-lg flex items-center justify-center mr-3 shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-medium text-red-600 dark:text-red-400">System Settings</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Configure portal settings</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}