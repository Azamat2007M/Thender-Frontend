"use client";

import React from "react";
import { TabProvider } from "../context/TabContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Suspense } from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TabProvider>
      <div className="w-full min-h-screen bg-gray-50 text-black selection:bg-orange-500 selection:text-black">
        {/* ИСПРАВЛЕНО: Обернули Navbar в Suspense, чтобы скрыть useSearchParams от сервера */}
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