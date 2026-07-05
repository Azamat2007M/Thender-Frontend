"use client";

import React from "react";
import { TabProvider } from "../context/TabContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TabProvider>
      <div className="w-full min-h-screen bg-gray-50 text-black selection:bg-orange-500 selection:text-black">
        <Navbar />
        <Sidebar />
        <main className="pt-16 pl-20 min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all">
          {children}
        </main>
      </div>
    </TabProvider>
  );
}