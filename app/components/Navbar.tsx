"use client";

import { useState, useEffect, useRef } from "react";
import LinkComponent from "next/link";
import Image from "next/image";
export const dynamic = "force-dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [usernameDisplay, setUsernameDisplay] = useState("User");
  const [avatarLetter, setAvatarLetter] = useState("U"); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname === "/search") {
      setSearchQuery(searchParams.get("q") || "");
    } else {
      setSearchQuery(""); 
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsernameDisplay(storedUsername);
      setAvatarLetter(storedUsername.charAt(0).toUpperCase());
    } else {
      setUsernameDisplay("User");
      setAvatarLetter("U");
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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&tab=posts`);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", 
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("username");
      window.location.href = "/";
    }
  };

  return (
    <nav className="w-full h-16 bg-white/85 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 z-50 px-4 sm:px-6 flex items-center justify-between gap-2">
      
      <div className="flex items-center min-w-auto sm:min-w-[160px] shrink-0">
        <LinkComponent href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-black p-0.5 border border-black flex items-center justify-center transition-transform group-hover:scale-105">
            <Image src="/Logo.svg" alt="Thender" width={28} height={28} className="object-contain invert" />
          </div>
          <span className="font-black text-lg sm:text-xl tracking-tight text-black hidden md:block">
            THENDER
          </span>
        </LinkComponent>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative mx-1 sm:mx-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts or channels..."
          className="w-full h-10 pl-4 pr-10 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white text-xs sm:text-sm text-black font-medium placeholder:text-gray-400 transition-all"
        />
        
        <button
          type="submit"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
        >
          <svg className="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      <div className="flex items-center justify-end min-w-auto sm:min-w-[160px] shrink-0 relative" ref={dropdownRef}>
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
              <p className="text-sm font-black text-black truncate">{usernameDisplay}</p>
            </div>

            <LinkComponent
              href="/profile"
              className="flex items-center px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
            >
              Profile
            </LinkComponent>

            <div
              className="flex items-center justify-between px-4 py-2 text-sm font-bold text-gray-400 select-none cursor-default"
            >
              <span>Settings</span>
              <span className="text-[10px] bg-orange-500 text-black px-1.5 py-0.5 rounded-md font-black tracking-wide uppercase shadow-sm">
                Soon
              </span>
            </div>

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