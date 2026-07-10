"use client";

import { useTab } from "../context/TabContext";
import { useRouter, usePathname } from "next/navigation";

type AllowedTabs = "feed" | "create" | "chat" | "support";

export default function Sidebar() {
  const { activeTab, setActiveTab } = useTab();
  const router = useRouter();
  const pathname = usePathname();

  const handleTabClick = (tabName: AllowedTabs) => {
    setActiveTab(tabName as any);
    
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  return (
    <aside 
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex flex-col items-center justify-between shadow-sm bg-white border-r border-gray-200 transition-all duration-300 w-14 py-4 md:w-20 md:py-6"
    >
      <div className="flex flex-col space-y-4 md:space-y-5 w-full px-2 md:px-3">
        <button
          onClick={() => handleTabClick("feed")}
          title="Global Feed"
          className={`w-10 h-10 md:w-full md:h-16 md:aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            activeTab === "feed"
              ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
              : "text-gray-400 hover:bg-gray-100 hover:text-black"
          }`}
        >
          <svg className="w-5 h-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </button>

        <button
          onClick={() => handleTabClick("create")}
          title="Create Post"
          className={`w-10 h-10 md:w-full md:h-16 md:aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            activeTab === "create"
              ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
              : "text-gray-400 hover:bg-gray-100 hover:text-black"
          }`}
        >
          <svg className="w-5 h-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          onClick={() => handleTabClick("chat")}
          title="Messages Matrix"
          className={`w-10 h-10 md:w-full md:h-16 md:aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            activeTab === "chat"
              ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
              : "text-gray-400 hover:bg-gray-100 hover:text-black"
          }`}
        >
          <svg className="w-5 h-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      <div className="w-full px-2 md:px-3">
        <button
          onClick={() => handleTabClick("support")}
          title="Complain & Suggestions"
          className={`w-10 h-10 md:w-full md:h-16 md:aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            activeTab === "support"
              ? "bg-black text-orange-500 shadow-lg"
              : "text-gray-400 hover:bg-orange-50 hover:text-orange-500"
          }`}
        >
          <svg className="w-5 h-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
      </div>

    </aside>
  );
}