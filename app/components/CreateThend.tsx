"use client";

import { useState } from "react";

interface CreateThendProps {
  onThendCreated?: () => void; 
}

export default function CreateThend({ onThendCreated }: CreateThendProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/thends/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Сессия истекла или вы не авторизованы. Войдите заново.");
        }
        throw new Error("Не удалось опубликовать пост. Попробуйте еще раз.");
      }

      setContent("");
      
      if (onThendCreated) {
        onThendCreated();
      }

    } catch (err: any) {
      setError(err.message || "Что-то пошло не так");
      console.error("Ошибка при создании thend:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
      <h2 className="text-2xl font-black tracking-tight text-black">Create New Thend</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          placeholder="What's engineering in your mind today? Share your new thend..."
          className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white text-sm text-black transition-all resize-none placeholder:text-gray-400 font-medium disabled:opacity-60"
          required
        />

        {error && (
          <p className="text-sm font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in duration-200">
            ⚠ {error}
          </p>
        )}

        <button 
          type="submit"
          disabled={loading || !content.trim()}
          className="px-6 h-11 bg-black hover:bg-gray-900 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Publishing...
            </>
          ) : (
            "Publish Thend"
          )}
        </button>
      </form>
    </div>
  );
}