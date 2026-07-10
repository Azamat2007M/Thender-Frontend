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
  image_url: string | null;
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

function ProfilePostImage({ src }: { src: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center relative select-none mt-2 max-h-[320px] sm:max-h-[450px]">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center min-h-[140px] sm:min-h-[200px]">
          <svg className="w-5 h-5 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      <img 
        src={src} 
        alt="Post attachment" 
        className={`w-full h-auto max-h-[320px] sm:max-h-[450px] object-contain transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thends/${thendId}/like`, {
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
    <div className="w-full max-w-2xl mx-auto pt-5 pb-12 px-4 sm:px-0 space-y-5 sm:space-y-6 select-none overflow-x-hidden">
      
      <button 
        onClick={() => router.push("/dashboard")} 
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 hover:text-black transition-colors cursor-pointer active:scale-95"
      >
        <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-800 space-y-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-orange-500 border-2 border-orange-400 flex items-center justify-center font-black text-xl sm:text-2xl text-black shadow-lg shrink-0">
            {userProfile.username[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-black tracking-tight text-white truncate">@{userProfile.username}</h2>
            <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-0.5">Developer's personal cabinet</p>
          </div>
        </div>

        <div className="pt-3 flex gap-4 sm:gap-6 text-[11px] sm:text-xs font-bold border-t border-gray-800/60 text-gray-400">
          <div className="hover:text-white transition-colors cursor-pointer">
            Followers <span className="text-orange-500 font-mono text-xs sm:text-sm pl-1">{userProfile.followers_count}</span>
          </div>
          <div className="hover:text-white transition-colors cursor-pointer">
            Following <span className="text-orange-500 font-mono text-xs sm:text-sm pl-1">{userProfile.following_count}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl sm:rounded-2xl border border-gray-200 h-11 sm:h-12 items-center w-full">
        <button
          onClick={() => handleTabChange("my-posts")}
          className={`flex-1 h-full text-xs sm:text-sm font-black rounded-lg sm:rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
            activeTab === "my-posts"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-gray-900"
          }`}
        >
          My Posts
        </button>
        <button
          onClick={() => handleTabChange("liked-posts")}
          className={`flex-1 h-full text-xs sm:text-sm font-black rounded-lg sm:rounded-xl transition-all cursor-pointer active:scale-[0.98] ${
            activeTab === "liked-posts"
              ? "bg-white text-black shadow-sm"
              : "text-gray-400 hover:text-gray-900"
          }`}
        >
          Liked Posts
        </button>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl text-center text-red-700 font-bold text-xs sm:text-sm">
          ❌ {error}
        </div>
      )}

      <div className="space-y-4 min-h-[250px] w-full">
        {loading ? (
          <div className="py-12 flex justify-center items-center text-gray-400 font-medium text-xs sm:text-sm gap-2">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            Updating list...
          </div>
        ) : thends.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-400 text-xs sm:text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50/50">
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
                className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm space-y-3 hover:border-orange-500/30 transition-all duration-300 w-full overflow-hidden"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-black text-xs sm:text-sm shadow-sm shrink-0">
                    {thend.author.username[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span 
                      onClick={() => handleUsernameClick(thend.author.username)}
                      className={`block font-extrabold text-xs sm:text-sm text-black truncate transition-colors ${
                        isNotMyPost ? "hover:text-orange-500 hover:underline cursor-pointer" : ""
                      }`}
                    >
                      @{thend.author.username}
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold">
                      {new Date(thend.created_at).toLocaleDateString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                <div 
                  className="text-gray-900 text-xs sm:text-sm leading-relaxed font-normal prose max-w-none visual-content break-words"
                  dangerouslySetInnerHTML={{ __html: thend.content }}
                />

                {thend.image_url && (
                  <ProfilePostImage src={thend.image_url} />
                )}

                <div className="pt-2 flex items-center gap-4 text-gray-400 border-t border-gray-50 text-[11px] sm:text-xs font-bold h-8">
                  <button 
                    onClick={() => handleLike(thend.id)}
                    className={`flex items-center gap-1.5 transition-colors group cursor-pointer min-w-[40px] h-full ${
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
                    <span className="font-mono text-xs select-none">{thend.likes_count}</span>
                  </button>

                  <button 
                    onClick={() => router.push(`/thend/${thend.id}`)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer group h-full"
                  >
                    <svg className="w-4 h-4 stroke-[2.5] group-hover:scale-105 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{thend.comments_count}</span>
                  </button>
                </div>

              </article>
            );
          })
        )}
      </div>
    </div>
  );
}