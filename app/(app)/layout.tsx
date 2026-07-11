"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TabProvider } from "../context/TabContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Suspense } from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/login");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-9 w-9 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
            Checking Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <TabProvider>
      <div className="w-full min-h-screen bg-gray-50 text-black selection:bg-orange-500 selection:text-black">
        <Suspense fallback={
          <div className="w-full h-16 bg-white/85 border-b border-gray-200 fixed top-0 left-0 z-50" />
        }>
          <Navbar />
        </Suspense>
        
        <Sidebar />
        <main className="pt-16 pl-20 min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all">
          {children}
        </main>
      </div>
    </TabProvider>
  );
}