"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchPayments,
  getReceiptLink,
  generateReceipt,
  type AdminPayment,
  type PaymentStatus,
} from "@/store/paymentsAdminSlice";
import { toast } from "react-toastify";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  CreditCardIcon,
  UserIcon,
  EnvelopeIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

const UNIVERSITY_NAME =
  process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Your University";

async function fetchLogoBase64(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    // Ensure PNG/JPEG for ExcelJS image support
    if (!/image\/(png|jpe?g)/.test(blob.type)) return null;
    const reader = new FileReader();
    return await new Promise((resolve) => {
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function AdminPaymentsPage() {
  const dispatch = useAppDispatch();
  const {
    items: payments,
    status,
    error,
  } = useAppSelector((s) => s.paymentsAdmin);
  const token = useAppSelector((s) => s.auth.token);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | PaymentStatus>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [programTypeFilter, setProgramTypeFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null
  );

  useEffect(() => {
    if (token && status === "idle") {
      dispatch(fetchPayments())
        .unwrap()
        .catch(() => {});
    }
  }, [dispatch, token, status]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return payments.filter((p) => {
      const matchesQuery =
        !q ||
        p.student_name?.toLowerCase().includes(q) ||
        p.student_email.toLowerCase().includes(q) ||
        p.transaction_ref.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesProgramType =
        !programTypeFilter ||
        p.fee?.program?.program_type === programTypeFilter;
      const matchesLevel = !levelFilter || p.level === levelFilter;
      const d = new Date(p.payment_date);
      const matchesStart = !start || d >= start;
      const matchesEnd = !end || d <= end;
      return (
        matchesQuery &&
        matchesStatus &&
        matchesProgramType &&
        matchesLevel &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [
    payments,
    query,
    statusFilter,
    programTypeFilter,
    levelFilter,
    startDate,
    endDate,
  ]);

  const selectedChildren = useMemo(() => {
    if (!selectedPayment) return [] as AdminPayment[];
    return payments.filter(
      (p) => p.original_reference === selectedPayment.transaction_ref
    );
  }, [payments, selectedPayment]);

  const paymentStats = useMemo(() => {
    const total = filtered.length;
    const successful = filtered.filter((p) => p.status === "successful").length;
    const pending = filtered.filter((p) => p.status === "pending").length;
    const failed = filtered.filter((p) => p.status === "failed").length;
    const totalRevenue = filtered
      .filter((p) => p.status === "successful")
      .reduce((sum, p) => sum + Number(p.amount_paid), 0);

    return { total, successful, pending, failed, totalRevenue };
  }, [filtered]);

  const onGetReceipt = async (id: number) => {
    try {
      await dispatch(getReceiptLink(id)).unwrap();
      toast.success("Receipt link fetched");
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err instanceof Error
          ? err.message
          : "Failed to get receipt";
      toast.error(msg);
    }
  };

  const onGenerateReceipt = async (id: number) => {
    try {
      await dispatch(generateReceipt(id)).unwrap();
      toast.success("Receipt generated");
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err instanceof Error
          ? err.message
          : "Failed to generate receipt";
      toast.error(msg);
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "successful":
        return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/50 dark:border-emerald-800";
      case "pending":
        return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/50 dark:border-amber-800";
      case "failed":
        return "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/50 dark:border-red-800";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/50 dark:border-gray-800";
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "successful":
        return <CheckCircleIcon className="w-3 h-3" />;
      case "pending":
        return <ClockIcon className="w-3 h-3" />;
      case "failed":
        return <XCircleIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getProgramTypeColor = (programType: string) => {
    switch (programType) {
      case "undergraduate":
        return "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/50 dark:border-blue-800";
      case "postgraduate":
        return "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/50 dark:border-purple-800";
      case "diploma":
        return "text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/50 dark:border-green-800";
      case "pre_degree":
        return "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/50 dark:border-orange-800";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/50 dark:border-gray-800";
    }
  };

  const onExportExcel = async () => {
    try {
      const ExcelJS = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Rebus Report");

      ws.columns = [
        { header: "Date", key: "payment_date", width: 20 },
        { header: "Student", key: "student_name", width: 24 },
        { header: "Email", key: "student_email", width: 28 },
        { header: "Amount", key: "amount_paid", width: 12 },
        { header: "Status", key: "status", width: 12 },
        { header: "Fee", key: "fee_name", width: 18 },
        { header: "Department", key: "department", width: 24 },
        { header: "Program Type", key: "program_type", width: 16 },
        { header: "Level", key: "level", width: 10 },
        { header: "Reference", key: "transaction_ref", width: 28 },
        { header: "Receipt URL", key: "receipt_drive_url", width: 40 },
      ];

      // Title row with university name
      ws.addRow([`${UNIVERSITY_NAME} — Payments Report`]);
      ws.mergeCells(1, 1, 1, ws.columns.length);
      const titleCell = ws.getCell(1, 1);
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { horizontal: "center" };

      // Attempt to embed logo from public folder
      const logo = await fetchLogoBase64("/university-logo.png");
      if (logo) {
        const imgId = wb.addImage({ base64: logo, extension: "png" });
        ws.addImage(imgId, {
          tl: { col: 0, row: 0 },
          ext: { width: 120, height: 60 },
        });
      }

      // Filters summary
      const filterText = `Status: ${statusFilter || "All"} | Program Type: ${
        programTypeFilter || "All"
      } | Level: ${levelFilter || "All"} | Date: ${startDate || "Any"} - ${
        endDate || "Any"
      }`;
      ws.addRow([filterText]);
      ws.mergeCells(2, 1, 2, ws.columns.length);
      ws.getCell(2, 1).alignment = { horizontal: "center" };
      ws.getCell(2, 1).font = { italic: true, color: { argb: "FF666666" } };

      // Header styling
      const headerRow = ws.addRow(ws.columns.map((c) => c.header || ""));
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern" as const,
          pattern: "solid" as const,
          fgColor: { argb: "FFEFF6FF" },
        };
        cell.border = {
          top: { style: "thin" as const },
          left: { style: "thin" as const },
          bottom: { style: "thin" as const },
          right: { style: "thin" as const },
        };
      });

      // Data rows
      for (const p of filtered) {
        ws.addRow({
          payment_date: formatDate(p.payment_date),
          student_name: p.student_name ?? "-",
          student_email: p.student_email,
          amount_paid: Number(p.amount_paid),
          status: p.status,
          fee_name: p.fee?.fee_category ?? String(p.fee_id),
          department: p.fee?.program?.program_name ?? "-",
          program_type: p.fee?.program?.program_type ?? "-",
          level: p.level ? String(p.level).replace("L", "") : "-",
          transaction_ref: p.transaction_ref,
          receipt_drive_url: p.receipt_drive_url ?? "",
        });
      }

      // Auto filter and freeze header
      ws.autoFilter = {
        from: { row: 3, column: 1 },
        to: { row: 3, column: ws.columns.length },
      };
      ws.views = [{ state: "frozen", ySplit: 3 }];

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      a.download = `rebus-report-${stamp}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to export Excel";
      toast.error(msg);
    }
  };

  const onDownload = async (p: AdminPayment) => {
    const link = p.receipt_drive_url;
    if (!link) {
      toast.info("No receipt link. Try Get Link or Generate.");
      return;
    }
    try {
      // Attempt direct open; many object stores handle download via query string.
      const a = document.createElement("a");
      a.href = link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    } catch {
      window.open(link, "_blank");
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header Section */}
      <div className="bg-[#3b82f6] rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Payment Management
            </h1>
            <p className="text-blue-100 text-sm sm:text-base">
              Monitor and manage all student payments
            </p>
          </div>
          <button
            onClick={onExportExcel}
            className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span className="sm:inline">Export Excel Report</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Payments
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {paymentStats.total.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Successful
              </p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                {paymentStats.successful.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">
                {paymentStats.pending.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Failed
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {paymentStats.failed.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                ₦{paymentStats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Filters & Search
            </h3>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 sm:ml-auto">
            Showing {filtered.length} of {payments.length} payments
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email or reference"
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter((e.target.value as PaymentStatus) || "")
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Program Type
            </label>
            <select
              value={programTypeFilter}
              onChange={(e) => setProgramTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Programs</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="diploma">Diploma</option>
              <option value="pre_degree">Pre-degree</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Level
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="ALL">All Levels</option>
              <option value="L100">100</option>
              <option value="L200">200</option>
              <option value="L300">300</option>
              <option value="L400">400</option>
              <option value="L500">500</option>
              <option value="L600">600</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <div className="relative">
              <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Student
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Fee
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Department
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Program
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Level
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Reference
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Receipt
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {status === "loading" && (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Loading payments...</span>
                    </div>
                  </td>
                </tr>
              )}
              {status === "failed" && (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <XCircleIcon className="w-12 h-12 text-red-500" />
                      <p className="text-red-600 font-medium">
                        {error ?? "Failed to load payments"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {status === "succeeded" && filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <CreditCardIcon className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500 font-medium">
                        No payments match your filters
                      </p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr
                  key={p.payment_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDate(p.payment_date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {p.student_name ?? "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {p.student_email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₦{Number(p.amount_paid).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        p.status
                      )}`}
                    >
                      {getStatusIcon(p.status)}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {Array.isArray(p.items) && p.items.length > 0
                      ? p.items
                          .map((it) =>
                            it.fee_category
                              ? String(it.fee_category)
                              : it.fee_id != null
                              ? String(it.fee_id)
                              : ""
                          )
                          .filter((s) => s && s.length > 0)
                          .join(", ")
                      : p.fee?.fee_category ?? String(p.fee_id)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {p.fee?.program?.program_name ?? "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getProgramTypeColor(
                        p.fee?.program?.program_type ?? ""
                      )}`}
                    >
                      <AcademicCapIcon className="w-3 h-3" />
                      {p.fee?.program?.program_type ?? "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {p.level ? String(p.level).replace("L", "") : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                      {p.transaction_ref}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    {p.receipt_drive_url ? (
                      <a
                        href={p.receipt_drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Open
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No link</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(p);
                          setDetailsOpen(true);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="View details"
                      >
                        <EyeIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => onGetReceipt(p.payment_id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Get Link
                      </button>
                      <button
                        onClick={() => onDownload(p)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-3 h-3" />
                        Download
                      </button>
                      <button
                        onClick={() => onGenerateReceipt(p.payment_id)}
                        disabled={p.status !== "successful"}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <DocumentTextIcon className="w-3 h-3" />
                        Generate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {status === "loading" && (
            <div className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-500">Loading payments...</span>
              </div>
            </div>
          )}
          {status === "failed" && (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <XCircleIcon className="w-12 h-12 text-red-500" />
                <p className="text-red-600 font-medium">
                  {error ?? "Failed to load payments"}
                </p>
              </div>
            </div>
          )}
          {status === "succeeded" && filtered.length === 0 && (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <CreditCardIcon className="w-12 h-12 text-gray-400" />
                <p className="text-gray-500 font-medium">
                  No payments match your filters
                </p>
                <p className="text-sm text-gray-400">
                  Try adjusting your search criteria
                </p>
              </div>
            </div>
          )}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((p) => (
              <div
                key={p.payment_id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {p.student_name ?? "Unknown Student"}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {p.student_email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      p.status
                    )} flex-shrink-0 ml-2`}
                  >
                    {getStatusIcon(p.status)}
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Amount:
                    </span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₦{Number(p.amount_paid).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Date:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(p.payment_date)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Fee:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {Array.isArray(p.items) && p.items.length > 0
                        ? p.items
                            .map((it) =>
                              it.fee_category
                                ? String(it.fee_category)
                                : it.fee_id != null
                                ? String(it.fee_id)
                                : ""
                            )
                            .filter((s) => s && s.length > 0)
                            .join(", ")
                        : p.fee?.fee_category ?? String(p.fee_id)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Level:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {p.level ? String(p.level).replace("L", "") : "-"}
                    </p>
                  </div>
                </div>

                {p.fee?.program && (
                  <div className="mb-3">
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {p.fee.program.program_name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getProgramTypeColor(
                          p.fee.program.program_type ?? ""
                        )}`}
                      >
                        <AcademicCapIcon className="w-3 h-3" />
                        {p.fee.program.program_type}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Reference:
                  </span>
                  <code className="block text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono mt-1">
                    {p.transaction_ref}
                  </code>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    {p.receipt_drive_url ? (
                      <a
                        href={p.receipt_drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Receipt
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">No receipt</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPayment(p);
                        setDetailsOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-3 h-3" />
                      Details
                    </button>
                    <button
                      onClick={() => onGetReceipt(p.payment_id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                      Get Link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {detailsOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Payment Details
                  </h3>
                  <p className="text-sm text-gray-500">
                    Transaction information and receipt
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailsOpen(false);
                  setSelectedPayment(null);
                }}
                className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Student Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Name:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPayment.student_name ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Email:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPayment.student_email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      JAMB:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPayment.jamb_number ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Matric:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPayment.matric_number ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Date:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedPayment.payment_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        selectedPayment.status
                      )}`}
                    >
                      {getStatusIcon(selectedPayment.status)}
                      {selectedPayment.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Full Amount:
                    </span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      ₦
                      {(() => {
                        const paid = Number(selectedPayment.amount_paid) || 0;
                        // Prefer items sum for multi-fee payments
                        const itemsTotal =
                          Array.isArray(selectedPayment.items) &&
                          selectedPayment.items.length > 0
                            ? selectedPayment.items.reduce(
                                (sum, it) => sum + Number(it.amount ?? 0),
                                0
                              )
                            : NaN;
                        const feeVal = selectedPayment.fee?.amount;
                        const feeAmt =
                          feeVal !== undefined && feeVal !== null
                            ? Number(feeVal)
                            : NaN;
                        const balVal = selectedPayment.balance_due;
                        const balDue =
                          balVal !== undefined && balVal !== null
                            ? Number(balVal)
                            : NaN;
                        const full = Number.isFinite(itemsTotal)
                          ? itemsTotal
                          : Number.isFinite(feeAmt)
                          ? feeAmt
                          : Number.isFinite(balDue)
                          ? paid + balDue
                          : paid;
                        return Number(full).toLocaleString();
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Amount Paid:
                    </span>
                    <span className="ml-2 font-semibold text-green-600">
                      ₦{Number(selectedPayment.amount_paid).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Percentage Paid:
                    </span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        const paid = Number(selectedPayment.amount_paid) || 0;
                        const itemsTotal =
                          Array.isArray(selectedPayment.items) &&
                          selectedPayment.items.length > 0
                            ? selectedPayment.items.reduce(
                                (sum, it) => sum + Number(it.amount ?? 0),
                                0
                              )
                            : NaN;
                        const feeVal = selectedPayment.fee?.amount;
                        const feeAmt =
                          feeVal !== undefined && feeVal !== null
                            ? Number(feeVal)
                            : NaN;
                        const balVal = selectedPayment.balance_due;
                        const balDue =
                          balVal !== undefined && balVal !== null
                            ? Number(balVal)
                            : NaN;
                        const full = Number.isFinite(itemsTotal)
                          ? itemsTotal
                          : Number.isFinite(feeAmt)
                          ? feeAmt
                          : Number.isFinite(balDue)
                          ? paid + balDue
                          : paid;
                        const pctBase =
                          typeof selectedPayment.percentage_paid === "number" &&
                          !Number.isNaN(selectedPayment.percentage_paid)
                            ? Number(selectedPayment.percentage_paid)
                            : full > 0
                            ? (paid / full) * 100
                            : 0;
                        const pct = Math.round(
                          Math.min(100, Math.max(0, pctBase))
                        );
                        return `${pct}%`;
                      })()}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Payment Type:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {(() => {
                        const paid = Number(selectedPayment.amount_paid) || 0;
                        const itemsTotal =
                          Array.isArray(selectedPayment.items) &&
                          selectedPayment.items.length > 0
                            ? selectedPayment.items.reduce(
                                (sum, it) => sum + Number(it.amount ?? 0),
                                0
                              )
                            : NaN;
                        const feeVal = selectedPayment.fee?.amount;
                        const feeAmt =
                          feeVal !== undefined && feeVal !== null
                            ? Number(feeVal)
                            : NaN;
                        const balVal = selectedPayment.balance_due;
                        const balDue =
                          balVal !== undefined && balVal !== null
                            ? Number(balVal)
                            : NaN;
                        const full = Number.isFinite(itemsTotal)
                          ? itemsTotal
                          : Number.isFinite(feeAmt)
                          ? feeAmt
                          : Number.isFinite(balDue)
                          ? paid + balDue
                          : paid;
                        const pctBase =
                          typeof selectedPayment.percentage_paid === "number" &&
                          !Number.isNaN(selectedPayment.percentage_paid)
                            ? Number(selectedPayment.percentage_paid)
                            : full > 0
                            ? (paid / full) * 100
                            : 0;
                        const pctRounded = Math.min(
                          100,
                          Math.max(0, Math.round(pctBase))
                        );
                        const isPartial =
                          !!selectedPayment.original_reference ||
                          pctRounded < 100;
                        return isPartial
                          ? `Partial Payment (${pctRounded}%)`
                          : "Full Payment";
                      })()}
                    </span>
                  </div>
                  {/* Balance section removed since we don't have access to original fee amount */}
                  <div className="md:col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Reference:
                    </span>
                    <code className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                      {selectedPayment.transaction_ref}
                    </code>
                  </div>
                </div>
              </div>

              {/* Balance Linkage */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Balance Linkage
                </h4>
                {selectedPayment?.original_reference ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      This is a balance child payment linked to:
                    </p>
                    <code className="block text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                      {selectedPayment.original_reference}
                    </code>
                    <button
                      onClick={() => {
                        setQuery(selectedPayment.original_reference ?? "");
                        setDetailsOpen(false);
                      }}
                      className="mt-2 inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/40 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50"
                    >
                      <MagnifyingGlassIcon className="w-3 h-3" />
                      Find parent in list
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      This is an original payment.
                    </p>
                    {selectedChildren.length > 0 ? (
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Linked balance payments:
                        </p>
                        <ul className="mt-2 space-y-1">
                          {selectedChildren.map((c) => (
                            <li
                              key={c.payment_id}
                              className="text-xs text-gray-800 dark:text-gray-200 flex items-center justify-between bg-white dark:bg-gray-800 rounded-md px-2 py-1 border border-gray-200 dark:border-gray-700"
                            >
                              <span className="font-mono">
                                {c.transaction_ref}
                              </span>
                              <span
                                className={
                                  c.status === "successful"
                                    ? "text-green-600"
                                    : c.status === "pending"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }
                              >
                                {c.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No balance payments linked.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Academic Information */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4" />
                  Academic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Department:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPayment.fee?.program?.program_name ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Program Type:
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getProgramTypeColor(
                        selectedPayment.fee?.program?.program_type ?? ""
                      )}`}
                    >
                      <AcademicCapIcon className="w-3 h-3" />
                      {selectedPayment.fee?.program?.program_type ?? "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Level:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPayment.level
                        ? String(selectedPayment.level).replace("L", "")
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Fee ID:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPayment.fee_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Receipt Information
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Receipt Status:
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedPayment.receipt_drive_url
                        ? "Available"
                        : "Not Generated"}
                    </span>
                  </div>
                  {selectedPayment.receipt_drive_url ? (
                    <a
                      href={selectedPayment.receipt_drive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Open Receipt
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      No receipt available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setDetailsOpen(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






