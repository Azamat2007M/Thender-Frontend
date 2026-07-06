"use client";

import { useEffect, useState } from "react";

// Описываем структуру данных, которую возвращает наш FastAPI бэкенд
interface Author {
  id: number;
  username: string;
  is_active: boolean;
}

interface Thend {
  id: number;
  content: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  author_id: number;
  author: Author;
}

export default function ThendsFeed() {
  const [thends, setThends] = useState<Thend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThends() {
      try {
        setLoading(true);
        // Запрос к эндпоинту FastAPI в Docker контейнере
        const response = await fetch("http://localhost:8000/thends/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load thends: ${response.status}`);
        }

        const data = await response.json();
        setThends(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        console.error("Error fetching thends:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchThends();
  }, []);

  // Состояние загрузки (красивый скелетон)
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight text-black">Global Thends</h2>
        {[1, 2].map((n) => (
          <div key={n} className="p-6 bg-white border border-gray-100 rounded-2xl animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-center text-red-700 font-bold text-sm">
        ❌ Error: {error}. Make sure your FastAPI backend is running!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black tracking-tight text-black">Global Thends</h2>
      
      {thends.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          No thends published yet. Be the first one!
        </div>
      ) : (
        thends.map((thend) => (
          <article 
            key={thend.id} 
            className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4 hover:border-orange-500/40 transition-all duration-300 hover:shadow-md"
          >
            {/* Шапка поста: Автор и Время */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-black shadow-sm">
                  {thend.author.username[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-black">@{thend.author.username}</h4>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(thend.created_at).toLocaleDateString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Контент */}
            <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line font-normal">
              {thend.content}
            </p>

            {/* Подвал: Метрики (Лайки) */}
            <div className="pt-2 flex items-center gap-4 text-gray-400">
              <button className="flex items-center gap-1.5 text-xs font-bold hover:text-orange-500 transition-colors group cursor-pointer">
                <svg className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{thend.likes_count}</span>
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}