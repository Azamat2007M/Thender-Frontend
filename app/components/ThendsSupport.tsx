"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import CustomSelect from "./CustomSelect";

export default function ThendsSupport() {
  const [type, setType] = useState("Suggestion / Feature Idea");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendToTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const currentUsername = Cookies.get("username") || "Anonymous";

    try {
      const response = await fetch("http://localhost:8000/support/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message_type: type,
          description: description,
          username: currentUsername,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send report");
      }

      setSuccess(true);
      setDescription(""); 
    } catch (error) {
      alert("Error sending report to backend. Check console.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-black">Report & Feedback</h2>
        <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider mt-4">
          Your message will be securely routed directly to our Telegram support channel.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-sm font-bold text-center">
          🚀 Sent successfully! Admin will review your text shortly.
        </div>
      )}
      
      <form onSubmit={handleSendToTelegram} className="space-y-4">
        <CustomSelect value={type} onChange={setType} />

        <div>
          <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="Explain your situation or proposal in detail..."
            className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white text-sm text-black transition-all resize-none placeholder:text-gray-400 font-medium disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Routing through proxy..." : "Send to Telegram Support"}
        </button>
      </form>
    </div>
  );
}