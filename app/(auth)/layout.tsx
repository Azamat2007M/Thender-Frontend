import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-3xl shadow-xl">
        {children}
      </div>
    </div>
  );
}