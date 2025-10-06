"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleTheme } from "@/store/uiSlice";

const UNIVERSITY_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Nigerian British University";

interface HeaderProps {
  currentPage?: "home" | "payment" | "lookup" | "callback";
  showThemeToggle?: boolean;
}

export default function Header({ currentPage = "home", showThemeToggle = true }: HeaderProps) {
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();

  // Sync theme with DOM classes
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "payment":
        return "Student Payment Portal";
      case "lookup":
        return "Payment Verification";
      case "callback":
        return "Payment Status";
      default:
        return "Welcome";
    }
  };

  const navigationItems = [
    { href: "/", label: "Home", active: currentPage === "home" },
    { href: "/payment", label: "Make Payment", active: currentPage === "payment" },
    { href: "/payment/lookup", label: "Verify Payment", active: currentPage === "lookup" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and University Name */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <img
              src="/logo.png"
              alt={`${UNIVERSITY_NAME} Logo`}
              className="h-20 w-20  object-contain "
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                (e.currentTarget as HTMLImageElement).src = "/vercel.svg"; 
              }}
            />
            <div>
              <h1 className="text-lg font-bold text-red-600 dark:text-red-400">{UNIVERSITY_NAME}</h1>
              <p className="text-sm text-blue-600 dark:text-blue-400">{getPageTitle()}</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                  item.active
                    ? "text-white bg-red-600 shadow-md"
                    : "text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {showThemeToggle && (
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors border border-blue-300 dark:border-blue-600"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2 1 1 0 000 2zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                className="p-2 rounded-lg bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 transition-colors border border-red-300 dark:border-red-600"
                aria-label="Open menu"
              >
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden border-t-2 border-red-500 py-4 bg-white/90 dark:bg-gray-900/90">
          <div className="flex flex-col space-y-3">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg mx-2 ${
                  item.active
                    ? "text-white bg-red-600 shadow-md"
                    : "text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}