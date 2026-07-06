"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 select-none">
      <div className="text-center space-y-6 max-w-md">
        
        <div className="relative inline-block">
          <h1 className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-700 to-gray-900 animate-pulse">
            404
          </h1>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-gray-900">Page Not Found</h2>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            It looks like this trend has been deleted, the user has changed their username, or you simply made a mistake in the URL.
          </p>
        </div>

        <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full" />

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-6 py-3 font-black text-sm bg-orange-500 hover:bg-orange-600 text-black rounded-xl shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Go to Home Page
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            ← Go Back
          </button>
        </div>

      </div>
    </div>
  );
}