"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const PageLoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Show loading on initial page load
  useEffect(() => {
    setIsLoading(true);

    // Hide after a minimum time to ensure visibility
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Show loading when route changes
  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Capture navigation events
  useEffect(() => {
    // Function to handle navigation start
    const handleNavigationStart = () => {
      setIsLoading(true);
    };

    // Function to handle navigation complete
    const handleNavigationComplete = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // Minimum display time
    };

    // Capture link clicks
    const handleLinkClick = (e: MouseEvent) => {
      // Only handle internal links with href attributes
      if (e.target instanceof Element) {
        const target = e.target.closest("a");
        if (
          target &&
          target.href &&
          target.href.startsWith(window.location.origin)
        ) {
          setIsLoading(true);
        }
      }
    };

    // Add event listeners
    document.addEventListener("click", handleLinkClick);
    window.addEventListener("beforeunload", handleNavigationStart);
    window.addEventListener("load", handleNavigationComplete);

    // For Next.js router events, we're already using usePathname and useSearchParams

    return () => {
      document.removeEventListener("click", handleLinkClick);
      window.removeEventListener("beforeunload", handleNavigationStart);
      window.removeEventListener("load", handleNavigationComplete);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 bg-opacity-80">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-gray-200 border-t-transparent rounded-full animate-spin-slow"></div>
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-ping"></div>

          <div className="absolute top-4 left-4 w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin-slower"></div>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoadingAnimation;
