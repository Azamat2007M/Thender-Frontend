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

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>(""); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function loadUserProfile() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/users/by-username/${username}`, {
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
    if (username) loadUserProfile();
  }, [username]);

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
      const response = await fetch(`http://localhost:8000/users/${profile.id}/follow`, {
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
      const response = await fetch("http://localhost:8000/chats/get-or-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_id: profile.id }),
        credentials: "include", 
      });

      if (response.ok) {
        const chatData = await response.json();
        router.push(`/chats/${chatData.id}`);
      } else {
        console.error("Failed to create or retrieve chat");
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
      const response = await fetch(`http://localhost:8000/thends/${thendId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Not able to like/unlike the thend");
    } catch (err) {
      console.error(err);
      loadUserProfile();
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400 animate-pulse">Loading profile...</div>;
  if (error || !profile) {
    notFound();
  }
  const isMyOwnProfile = profile.username === currentUsername;

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 select-none">
      <button onClick={() => router.push("/")} className="text-sm font-bold text-gray-500 hover:text-black transition-colors cursor-pointer">
        ← Go to Home Page
      </button>

      <div className="p-6 bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl shadow-xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500 border-2 border-orange-400 flex items-center justify-center font-black text-2xl text-black shadow-lg shrink-0">
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">@{profile.username}</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {isMyOwnProfile ? "This is your profile (view from the outside)" : "User profile"}
              </p>
            </div>
          </div>

          {!isMyOwnProfile && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartChat}
                className="px-4 py-2 font-black text-xs rounded-xl bg-white/10 hover:bg-white/20 text-white border border-gray-800 transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <span>💬</span> Message
              </button>

              <button
                onClick={handleFollow}
                className={`px-4 py-2 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer active:scale-95 ${
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

        <div className="pt-3 flex gap-6 text-xs font-bold border-t border-gray-800/60 text-gray-400">
          <div>
            Followers <span className="text-orange-500 font-mono text-sm pl-1">{profile.followers_count}</span>
          </div>
          <div>
            Following <span className="text-orange-500 font-mono text-sm pl-1">{profile.following_count}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-900 pl-1">Publications</h3>
        
        {profile.thends.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            This user has no publications yet.
          </div>
        ) : (
          profile.thends.map((thend) => (
            <article 
              key={thend.id} 
              className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4 hover:border-orange-500/40 transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center font-bold text-xs text-black shrink-0">
                  {profile.username[0].toUpperCase()}
                </div>
                <span className="font-extrabold text-xs text-black">@{profile.username}</span>
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
                  className="flex items-center gap-1 text-gray-400 hover:text-orange-500 cursor-pointer group transition-colors"
                >
                  <span className="group-hover:scale-110 transition-transform">💬</span>
                  <span className="font-mono text-xs">{thend.comments_count || 0}</span>
                </button>
                
                <span className="ml-auto text-[10px] text-gray-400 font-medium">
                  {new Date(thend.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}