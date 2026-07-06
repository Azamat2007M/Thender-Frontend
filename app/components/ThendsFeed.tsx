"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  is_liked: boolean;
  comments_count: number; 
}

export default function ThendsFeed() {
    const [thends, setThends] = useState<Thend[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string>("");
    const router = useRouter();

    const handleUsernameClick = (authorUsername: string) => {
        if (authorUsername === currentUsername) {
            router.push("/profile");
        } else {
            router.push(`/user/${authorUsername}`);
        }
    };

    async function fetchCurrentUser() {
        try {
            const response = await fetch("http://localhost:8000/users/me", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            });
            if (response.ok) {
            const data = await response.json();
            setCurrentUsername(data.username); 
            }
        } catch (err) {
            console.error("Error fetching current user:", err);
        }
    }

  async function fetchThends() {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/thends/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
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

  useEffect(() => {
    fetchCurrentUser();
    fetchThends();
  }, []);

  const handleLike = async (thendId: number) => {
    const originalThends = [...thends];
    
    try {
      const response = await fetch(`http://localhost:8000/thends/${thendId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("You must be logged in to like posts!");
          return;
        }
        throw new Error("Error processing like");
      }

      const updatedThend: Thend = await response.json();

      setThends((prevThends) =>
        prevThends.map((t) => (t.id === thendId ? updatedThend : t))
      );

    } catch (err) {
      console.error("Like error:", err);
      setThends(originalThends);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
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

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-center text-red-700 font-bold text-sm">
        ❌ Error: {error}. Make sure your FastAPI backend is running!
      </div>
    );
  }

  return (
    <div className="space-y-6">      
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-black shadow-sm">
                  {thend.author.username[0].toUpperCase()}
                </div>
                <div>
                    <span 
                        onClick={() => handleUsernameClick(thend.author.username)}
                        className="font-extrabold text-xs text-black hover:text-orange-500 hover:underline cursor-pointer transition-colors"
                    >
                        @{thend.author.username}
                    </span>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(thend.created_at).toLocaleDateString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line font-normal">
              {thend.content}
            </p>

            <div className="pt-2 flex items-center gap-4 text-gray-400">
                <button 
                    onClick={() => handleLike(thend.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors group cursor-pointer ${
                        thend.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                >
                    <svg 
                        className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" 
                        fill={thend.is_liked ? "currentColor" : "none"}
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{thend.likes_count}</span>
                </button>

                <button 
                    onClick={() => router.push(`/thend/${thend.id}`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors group cursor-pointer"
                >
                    <svg 
                        className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{thend.comments_count}</span>
                </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}