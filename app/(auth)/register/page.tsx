"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong. Please try again.");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-14 h-14 rounded-2xl bg-black p-0.5 border border-black flex items-center justify-center shadow-md">
          <Image src="/Logo.svg" alt="Thender Logo" width={44} height={44} className="object-contain invert" priority />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-black pt-1">
          Create Account
        </h2>
        <p className="text-xs text-orange-500 uppercase tracking-widest font-black">
          Join Thender Today
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3.5 rounded-xl text-sm font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
            Username
          </label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="w-full h-11 px-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-black font-medium placeholder:text-gray-400 autofill:shadow-[inset_0_0_0_1000px_#ffffff] autofill:text-black"
            placeholder="e.g. azamat_thender"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full h-11 px-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-black font-medium placeholder:text-gray-400 autofill:shadow-[inset_0_0_0_1000px_#ffffff] autofill:text-black"
            placeholder="azamat@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full h-11 px-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm text-black font-medium placeholder:text-gray-400 autofill:shadow-[inset_0_0_0_1000px_#ffffff] autofill:text-black"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 font-medium">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-500 hover:underline font-bold ml-1">
          Sign In
        </Link>
      </p>
    </div>
  );
}