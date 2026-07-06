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

interface UserProfile {
  username: string;
  followers_count: number;
  following_count: number;
}

type ProfileTab = "my-posts" | "liked-posts";

export default function ProfilePage() {
  const [thends, setThends] = useState<Thend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("my-posts");
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: "User",
    followers_count: 0,
    following_count: 0,
  });

  const router = useRouter();

  async function fetchCurrentUser() {
    try {
      const response = await fetch("http://localhost:8000/users/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          username: data.username,
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }

  async function fetchProfileData(tab: ProfileTab, silent = false) {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const endpoint = tab === "my-posts" ? "/thends/me" : "/thends/liked";
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Вы должны быть авторизованы для просмотра этого раздела");
        }
        throw new Error(`Ошибка загрузки данных: ${response.status}`);
      }

      const data = await response.json();
      setThends(data);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCurrentUser();
    fetchProfileData(activeTab);
  }, []);

  const handleTabChange = (tab: ProfileTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    fetchProfileData(tab, false);
  };

  const handleUsernameClick = (authorUsername: string) => {
    if (authorUsername !== userProfile.username) {
      router.push(`/user/${authorUsername}`);
    }
  };

  const handleLike = async (thendId: number) => {
    setThends((prevThends) =>
      prevThends.map((t) => {
        if (t.id === thendId) {
          const wasLiked = t.is_liked;
          return {
            ...t,
            is_liked: !wasLiked,
            likes_count: wasLiked ? t.likes_count - 1 : t.likes_count + 1,
          };
        }
        return t;
      })
    );

    try {
      const response = await fetch(`http://localhost:8000/thends/${thendId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error toggling like status");
      }
      
      if (activeTab === "liked-posts") {
        setThends((prev) => prev.filter((t) => t.id !== thendId));
      }
    } catch (err) {
      console.error(err);
      fetchProfileData(activeTab, true);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 select-none [&::-webkit-scrollbar]:none [-ms-overflow-style:none] [scrollbar-width:none]">
      <button 
        onClick={() => router.push("/")} 
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors cursor-pointer"
      >
        ← Back to Home
      </button>

      <div className="p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl shadow-xl border border-gray-800 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 border-2 border-orange-400 flex items-center justify-center font-black text-2xl text-black shadow-lg shrink-0">
            {userProfile.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">@{userProfile.username}</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Developer's personal cabinet</p>
          </div>
        </div>

        <div className="pt-3 flex gap-6 text-xs font-bold border-t border-gray-800/60 text-gray-400">
          <div className="hover:text-white transition-colors cursor-pointer">
            Followers <span className="text-orange-500 font-mono text-sm pl-1">{userProfile.followers_count}</span>
          </div>
          <div className="hover:text-white transition-colors cursor-pointer">
            Following <span className="text-orange-500 font-mono text-sm pl-1">{userProfile.following_count}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200 h-12 items-center">
        <button
          onClick={() => handleTabChange("my-posts")}
          className={`flex-1 h-full text-sm font-black rounded-xl transition-all cursor-pointer ${
            activeTab === "my-posts"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-gray-900"
          }`}
        >
          My Posts
        </button>
        <button
          onClick={() => handleTabChange("liked-posts")}
          className={`flex-1 h-full text-sm font-black rounded-xl transition-all cursor-pointer ${
            activeTab === "liked-posts"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-gray-900"
          }`}
        >
          Liked Posts
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 font-bold text-sm">
          ❌ {error}
        </div>
      )}

      <div className="space-y-4 min-h-[300px]">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-medium animate-pulse">Updating list...</div>
        ) : thends.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            {activeTab === "my-posts" 
              ? "You haven't published any trends yet." 
              : "You haven't liked any trends yet."}
          </div>
        ) : (
          thends.map((thend) => {
            const isNotMyPost = thend.author.username !== userProfile.username;
            return (
              <article 
                key={thend.id} 
                className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4 hover:border-orange-500/40 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center font-bold text-xs text-black shrink-0">
                    {thend.author.username[0].toUpperCase()}
                  </div>
                  <span 
                    onClick={() => handleUsernameClick(thend.author.username)}
                    className={`font-extrabold text-xs text-black transition-colors ${
                      isNotMyPost ? "hover:text-orange-500 hover:underline cursor-pointer" : ""
                    }`}
                  >
                    @{thend.author.username}
                  </span>
                </div>

                <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line font-normal">
                  {thend.content}
                </p>

                <div className="pt-2 flex items-center gap-4 text-gray-400 border-t border-gray-50/80 text-xs font-bold h-7">
                  <button 
                    onClick={() => handleLike(thend.id)}
                    className={`flex items-center gap-1.5 transition-colors group cursor-pointer min-w-[45px] ${
                      thend.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <svg 
                      className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform shrink-0" 
                      fill={thend.is_liked ? "currentColor" : "none"}
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-mono text-xs w-4 text-left select-none">{thend.likes_count}</span>
                  </button>

                  <button 
                    onClick={() => router.push(`/thend/${thend.id}`)}
                    className="flex items-center gap-1 text-gray-400 hover:text-orange-500 cursor-pointer"
                  >
                    💬 {thend.comments_count}
                  </button>
                  
                  <span className="ml-auto text-[10px] text-gray-400 font-medium">
                    {new Date(thend.created_at).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}