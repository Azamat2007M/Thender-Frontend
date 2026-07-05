"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function Navbar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarLetter, setAvatarLetter] = useState("U"); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const username = Cookies.get("username");
    if (username) {
      setAvatarLetter(username.charAt(0).toUpperCase());
    }
  }, [pathname]); 

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    Cookies.remove("token");
    Cookies.remove("username");
    window.location.href = "/";
  };

  return (
    <nav className="w-full h-16 bg-white/85 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 z-50 px-6 flex items-center justify-between">
      
      <div className="flex items-center min-w-[160px]">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-black p-0.5 border border-black flex items-center justify-center transition-transform group-hover:scale-105">
            <Image src="/Logo.svg" alt="Thender" width={28} height={28} className="object-contain invert" />
          </div>
          <span className="font-black text-xl tracking-tight text-black hidden sm:block">
            THENDER
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-md mx-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full h-10 pl-9 pr-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white text-sm text-black font-medium placeholder:text-gray-400 transition-all autofill:shadow-[inset_0_0_0_1000px_#ffffff] autofill:text-black"
        />
      </div>

      <div className="flex items-center justify-end min-w-[160px] relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-9 h-9 rounded-full bg-orange-500 border border-orange-600 flex items-center justify-center text-black font-black text-sm shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
        >
          {avatarLetter}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
            <div className="px-4 py-1.5 border-b border-gray-100 mb-1">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-black text-black truncate">{Cookies.get("username") || "User"}</p>
            </div>

            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
            >
              Profile
            </Link>

            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
            >
              Settings
            </Link>

            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-2 text-sm font-black text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}