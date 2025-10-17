"use client";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setToken } from "@/store/authSlice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Suspense } from "react";
import PageLoadingAnimation from "@/lib/LoadingProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/admin/login");
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);

  // Hydrate token from localStorage to survive HMR/full reloads in dev
  useEffect(() => {
    try {
      const t =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      if (t && !token) dispatch(setToken(t));
    } catch {}
  }, [dispatch, token]);

  if (isLogin) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        {children}
      </main>
    );
  }

  return (
    <Suspense fallback={null}>
      <PageLoadingAnimation />
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 h-screen">
          <AdminHeader />
          <main className="flex-1 p-4 overflow-auto">{children}</main>
          <ToastContainer position="top-right" autoClose={3000} theme="light" />
        </div>
      </div>
    </Suspense>
  );
}
