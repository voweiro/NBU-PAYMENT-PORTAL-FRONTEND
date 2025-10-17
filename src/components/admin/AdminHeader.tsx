"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleSidebar } from "@/store/uiSlice";
import { logout } from "@/store/authSlice";

const routeMeta: Record<
  string,
  { title: string; description: string; icon: string }
> = {
  "": {
    title: "Dashboard",
    description: "Overview of platform status and analytics",
    icon: "📊",
  },
  payments: {
    title: "Payments",
    description: "Manage payment transactions and records",
    icon: "💳",
  },
  programs: {
    title: "Programs",
    description: "Configure academic programs and courses",
    icon: "🎓",
  },
  fees: {
    title: "Fees",
    description: "Set up program fees and payment structures",
    icon: "💰",
  },
  admins: {
    title: "Admins",
    description: "Manage administrator accounts and permissions",
    icon: "👥",
  },
};

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const slug = (pathname.replace(/^\/?admin\/?/, "").split("/")[0] ||
    "") as keyof typeof routeMeta;
  const meta = routeMeta[slug] ?? {
    title: "Admin Panel",
    description: "Administration dashboard",
    icon: "⚙️",
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("auth_token");
    } catch {}
    dispatch(logout());
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-[#ffede6] backdrop-blur-md border-b-2 border-gray-500 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Sidebar Toggle */}
          <button
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors border border-red-300"
          >
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Page Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md border border-red-300">
              <span className="text-white text-lg">{meta.icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-red-600">{meta.title}</h1>
              <p className="text-sm text-blue-600 hidden sm:block">
                {meta.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors border border-blue-300">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v12"
              />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></span>
          </button>

          {/* User Profile Section */}
          <div className="flex items-center space-x-3 pl-3 border-l-2 border-red-500">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-red-600">Admin User</p>
              <p className="text-xs text-blue-600">System Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md border-2 border-blue-300">
              <span className="text-white text-sm font-bold">A</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md border border-red-500"
              title="Logout"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
