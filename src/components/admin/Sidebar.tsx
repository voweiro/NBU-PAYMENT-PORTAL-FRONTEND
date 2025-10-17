"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleSidebar } from "@/store/uiSlice";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "📊",
    description: "Overview & Analytics",
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: "💳",
    description: "Transaction Management",
  },
  {
    href: "/admin/programs",
    label: "Programs",
    icon: "🎓",
    description: "Academic Programs",
  },
  {
    href: "/admin/fees",
    label: "Fees",
    icon: "💰",
    description: "Fee Configuration",
  },
  {
    href: "/admin/admins",
    label: "Admins",
    icon: "👥",
    description: "User Management",
  },
];

const UNIVERSITY_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "University";

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.sidebarOpen);

  return (
    <aside
      className={`${
        open ? "w-72" : "w-20"
      } transition-all duration-300 ease-in-out border-r-2 border-white bg-[#ffede6] h-full flex flex-col shadow-lg`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 border-b-2 border-white">
        {open ? (
          <>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center shadow-md border border-gray-300">
                <span className="text-white font-bold text-lg">🏛️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-600 truncate">
                  {UNIVERSITY_NAME}
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  Admin Portal
                </p>
              </div>
            </div>
            <button
              aria-label="Toggle sidebar"
              onClick={() => dispatch(toggleSidebar())}
              className="ml-2 p-2 rounded-lg bg-[#ffede6] hover:bg-blue-200 transition-colors border border-gray-400"
              title="Toggle Sidebar"
            >
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </>
        ) : (
          <button
            aria-label="Toggle sidebar"
            onClick={() => dispatch(toggleSidebar())}
            className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-md border border-red-300 hover:from-red-700 hover:to-red-800 transition-all"
            title="Expand Sidebar"
          >
            <span className="text-white font-bold text-lg">🏛️</span>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#ff6347] text-white shadow-lg transform scale-105"
                  : "text-white hover:bg-white hover:text-red-600"
              }`}
              title={open ? "" : item.label}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-blue-100 text-blue-600 group-hover:bg-red-100 group-hover:text-red-600"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
              </div>

              {/* nav items styling section */}
              {open && (
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm truncate ${
                      isActive
                        ? "text-white"
                        : "text-black group-hover:text-red-600"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      isActive
                        ? "text-white/80"
                        : "text-black group-hover:text-red-500"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              )}

              {isActive && open && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div
        className={`p-4 border-t-2 border-gray-500 ${
          open ? "block" : "hidden"
        }`}
      >
        <div className="bg-gradient-to-r from-blue-50 to-red-50 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="text-xs font-medium text-red-600">System Status</p>
          </div>
          <p className="text-xs text-blue-600 leading-relaxed">
            All systems operational. Last updated 2 minutes ago.
          </p>
        </div>
      </div>
    </aside>
  );
}
