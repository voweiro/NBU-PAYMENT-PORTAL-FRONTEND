"use client";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { login } from "@/store/authSlice";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon, 
  UserIcon, 
  LockClosedIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

const UNIVERSITY_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Nigerian British University";

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((s) => s.auth.status);
  const error = useAppSelector((s) => s.auth.error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const isPasswordValid = useMemo(() => password.length >= 6, [password]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || !isPasswordValid) return;
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      // Persist token to localStorage to survive dev reloads
      try {
        localStorage.setItem("auth_token", result.token);
      } catch {}
      router.push("/admin");
    } catch {}
  };

  const disabled = status === "loading" || !isEmailValid || !isPasswordValid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left brand panel - Enhanced */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600/95 to-indigo-700/95 backdrop-blur-sm">
          <div>
            {/* University branding */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <AcademicCapIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{UNIVERSITY_NAME}</h3>
                <p className="text-blue-100 text-sm">Payment Portal Administration</p>
              </div>
            </div>

            {/* Status badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm text-white mb-8">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure Admin Portal
            </div>

            {/* Welcome content */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight">
                Welcome Back,
                <span className="block text-blue-200">Administrator</span>
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                Access your administrative dashboard to manage programs, fees, payments, and monitor university operations with advanced analytics.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3 text-blue-100">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-4 h-4" />
                </div>
                <span className="text-sm">Real-time Analytics & Reporting</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-4 h-4" />
                </div>
                <span className="text-sm">Payment Management System</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4" />
                </div>
                <span className="text-sm">Secure Access Control</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="grid grid-cols-3 gap-4 opacity-60">
            <div className="h-20 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
            </div>
            <div className="h-20 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
            </div>
            <div className="h-20 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Right form panel - Enhanced */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{UNIVERSITY_NAME}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Admin Portal Access</p>
            </div>

            {/* Login form card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-blue-500/10">
              <div className="p-8">
                {/* Form header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Secure Login</h2>
                  <p className="mt-2 text-gray-600">
                    Enter your administrator credentials to continue
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="admin@university.edu"
                        aria-invalid={!isEmailValid && email.length > 0}
                        required
                      />
                    </div>
                    {!isEmailValid && email.length > 0 && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">!</span>
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  {/* Password field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your password"
                        aria-invalid={!isPasswordValid && password.length > 0}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {!isPasswordValid && password.length > 0 && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">!</span>
                        Password must be at least 6 characters long
                      </p>
                    )}
                  </div>

                  {/* Remember me and forgot password */}
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      Remember me
                    </label>
                    <Link 
                      href="#" 
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl" role="alert">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                          <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                        </div>
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={disabled}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {status === "loading" && (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    {status === "loading" ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Need access? 
                <Link href="#" className="ml-1 text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  Contact an administrator
                </Link>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                © 2024 {UNIVERSITY_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}