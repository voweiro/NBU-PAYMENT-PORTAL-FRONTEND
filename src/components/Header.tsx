"use client";

import Link from "next/link";
import { useState } from "react";

const UNIVERSITY_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Nigerian British University";

interface HeaderProps {
  currentPage?: "home" | "payment" | "lookup" | "callback";
}

export default function Header({ currentPage = "home" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-red-500 shadow-lg">
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
              <h1 className="text-lg font-bold text-red-600">{UNIVERSITY_NAME}</h1>
              <p className="text-sm text-blue-600">{getPageTitle()}</p>
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
                    : "text-blue-600 hover:text-white hover:bg-blue-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 transition-colors border border-red-300"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-2 border-red-500 py-4 bg-white/90">
            <div className="flex flex-col space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg mx-2 ${
                    item.active
                      ? "text-white bg-red-600 shadow-md"
                      : "text-blue-600 hover:text-white hover:bg-blue-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}