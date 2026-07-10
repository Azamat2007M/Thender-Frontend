"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, notFound } from "next/navigation";

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
  id: number;
  username: string;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  thends: Thend[];
}

function ProfilePostImage({ src }: { src: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const imageUrl = src.startsWith("http") ? src : `${process.env.NEXT_PUBLIC_API_URL}${src}`;

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
        src={imageUrl} 
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

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>(""); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  async function fetchCurrentUser() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
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
    } finally {
      setIsAuthChecked(true);
    }
  }

  async function loadUserProfile() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/by-username/${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("User not found");
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Error loading profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (username && isAuthChecked) {
      loadUserProfile();
    }
  }, [username, isAuthChecked]);

  const handleFollow = async () => {
    if (!profile) return;

    setProfile((prev) => {
      if (!prev) return null;
      const willFollow = !prev.is_following;
      return {
        ...prev,
        is_following: willFollow,
        followers_count: willFollow ? prev.followers_count + 1 : prev.followers_count - 1,
      };
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${profile.id}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Error changing subscription status");
    } catch (err) {
      console.error(err);
      loadUserProfile(); 
    }
  };

  const handleStartChat = async () => {
    if (!profile) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/get-or-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: profile.id }),
        credentials: "include", 
      });

      if (response.ok) {
        const chatData = await response.json();
        router.push(`/chats/${chatData.id}`);
      }
    } catch (err) {
      console.error("Error initializing chat:", err);
    }
  };

  const handleLike = async (thendId: number) => {
    if (!profile) return;

    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        thends: prevProfile.thends.map((t) => {
          if (t.id === thendId) {
            const wasLiked = t.is_liked;
            return {
              ...t,
              is_liked: !wasLiked,
              likes_count: wasLiked ? t.likes_count - 1 : t.likes_count + 1,
            };
          }
          return t;
        }),
      };
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thends/${thendId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Not able to like/unlike");
    } catch (err) {
      console.error(err);
      loadUserProfile();
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center text-gray-400 font-medium text-xs gap-2">
        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        Updating...
      </div>
    );
  }

  if (error || !profile) {
    notFound();
  }

  const isMyOwnProfile = profile.username === currentUsername;

  return (
    <div className="w-full max-w-2xl mx-auto pt-5 pb-12 px-4 sm:px-0 space-y-4 sm:space-y-6 select-none overflow-x-hidden">
      
      <button 
        onClick={() => router.push("/dashboard")} 
        className="inline-flex items-center gap-1.5 text-[11px] sm:text-sm font-bold text-gray-400 hover:text-black transition-colors cursor-pointer active:scale-95"
      >
        ← Back to Dashboard
      </button>

      <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-800 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-orange-500 border border-orange-400 flex items-center justify-center font-black text-lg sm:text-2xl text-black shadow-lg shrink-0">
              {profile.username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-xl font-black tracking-tight text-white truncate">@{profile.username}</h2>
              <p className="text-[9px] sm:text-xs text-gray-400 font-medium mt-0.5">
                {isMyOwnProfile ? "This is your profile (preview mode)" : "User profile"}
              </p>
            </div>
          </div>

          {!isMyOwnProfile && (
            <div className="flex items-center gap-2 w-full sm:w-auto pt-0.5 sm:pt-0">
              <button
                onClick={handleStartChat}
                className="flex-1 sm:flex-none justify-center px-3 h-8 sm:h-10 font-black text-[11px] sm:text-xs rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white border border-gray-800 transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <span>💬</span> Message
              </button>

              <button
                onClick={handleFollow}
                className={`flex-1 sm:flex-none justify-center px-3 h-8 sm:h-10 font-black text-[11px] sm:text-xs rounded-lg sm:rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 ${
                  profile.is_following
                    ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                    : "bg-orange-500 hover:bg-orange-600 text-black"
                }`}
              >
                {profile.is_following ? "Unfollow" : "Follow"}
              </button>
            </div>
          )}
        </div>

        <div className="pt-2.5 flex gap-4 text-[10px] sm:text-xs font-bold border-t border-gray-800/60 text-gray-400">
          <div className="hover:text-white transition-colors cursor-pointer">
            Followers <span className="text-orange-500 font-mono text-xs sm:text-sm pl-0.5">{profile.followers_count}</span>
          </div>
          <div className="hover:text-white transition-colors cursor-pointer">
            Following <span className="text-orange-500 font-mono text-xs sm:text-sm pl-0.5">{profile.following_count}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 w-full">
        <h3 className="text-[10px] sm:text-xs font-black text-gray-400 pl-1 uppercase tracking-wider">Publications</h3>
        
        {profile.thends.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-400 text-xs font-medium border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50/50">
            This user has no publications yet.
          </div>
        ) : (
          profile.thends.map((thend) => (
            <article 
              key={thend.id} 
              className="p-4 sm:p-6 bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm space-y-3 hover:border-orange-500/30 transition-all duration-300 w-full overflow-hidden"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-black text-xs shadow-sm shrink-0">
                  {profile.username[0].toUpperCase()}
                </div>
                <div>
                  <span className="block font-extrabold text-xs sm:text-sm text-black">
                    @{profile.username}
                  </span>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold leading-none mt-0.5">
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

              <div className="pt-2 flex items-center gap-4 text-gray-400 border-t border-gray-50 text-[11px] sm:text-xs font-bold h-7">
                <button 
                  onClick={() => handleLike(thend.id)}
                  className={`flex items-center gap-1.5 transition-colors group cursor-pointer min-w-[35px] h-full ${
                    thend.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <svg 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] group-hover:scale-110 transition-transform shrink-0" 
                    fill={thend.is_liked ? "currentColor" : "none"} 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-mono select-none">{thend.likes_count}</span>
                </button>

                <button 
                  onClick={() => router.push(`/thend/${thend.id}`)}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer group h-full"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] group-hover:scale-105 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{thend.comments_count}</span>
                </button>
              </div>

            </article>
          ))
        )}
      </div>
    </div>
  );
}