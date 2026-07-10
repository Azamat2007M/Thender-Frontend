"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

function PostImage({ src, onClick }: { src: string; onClick: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={onClick}
      className="w-full h-[200px] sm:h-[280px] md:h-[420px] overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center cursor-zoom-in relative"
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      
      <img 
        src={src} 
        alt="Post attachment" 
        className={`w-full h-full object-cover transition-all duration-500 hover:scale-[1.01] ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}

export default function ThendsFeed() {
    const [thends, setThends] = useState<Thend[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUsername, setCurrentUsername] = useState<string>("");
    const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
    const [skip, setSkip] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const LIMIT = 7;

    const router = useRouter();
    const observer = useRef<IntersectionObserver | null>(null);

    const lastPostRef = useCallback((node: HTMLElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setSkip((prevSkip) => prevSkip + LIMIT);
        }
      });

      if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handleUsernameClick = (authorUsername: string) => {
        if (authorUsername === currentUsername) {
            router.push("/profile");
        } else {
            router.push(`/user/${authorUsername}`);
        }
    };

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
        }
    }

  const fetchThends = useCallback(async (currentSkip: number, isInitial: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thends/?skip=${currentSkip}&limit=${LIMIT}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
      });

      if (!response.ok) {
        throw new Error(`Failed to load thends: ${response.status}`);
      }

      const data: Thend[] = await response.json();
      
      if (isInitial) {
        setThends(data);
      } else {
        setThends((prev) => {
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNewData = data.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNewData];
        });
      }

      if (data.length < LIMIT) {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error("Error fetching thends:", err);
    } finally {
      setLoading(false);
      if (isInitial) setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchThends(0, true);
  }, [fetchThends]);

  useEffect(() => {
    if (skip > 0) {
      fetchThends(skip, false);
    }
  }, [skip, fetchThends]);

  const handleLike = async (thendId: number) => {
    const originalThends = [...thends];
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thends/${thendId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  if (initialLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="p-4 sm:p-6 bg-white border border-gray-100 rounded-2xl animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            </div>
            <div className="h-3.5 bg-gray-200 rounded w-full" />
            <div className="h-3.5 bg-gray-200 rounded w-2/3" />
            <div className="h-44 sm:h-64 bg-gray-100 rounded-xl w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error && thends.length === 0) {
    return (
      <div className="p-4 sm:p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-center text-red-700 font-bold text-xs sm:text-sm">
        ❌ Error: {error}. Make sure your FastAPI backend is running!
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">      
      {thends.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-sm">
          No thends published yet. Be the first one!
        </div>
      ) : (
        thends.map((thend, index) => {
          const isLastElement = thends.length === index + 1;
          
          return (
            <article 
              key={thend.id} 
              ref={isLastElement ? lastPostRef : null}
              className="p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3 sm:space-y-4 hover:border-orange-500/40 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-black text-sm sm:text-base shadow-sm shrink-0">
                    {thend.author.username[0].toUpperCase()}
                  </div>
                  <div>
                      <span 
                          onClick={() => handleUsernameClick(thend.author.username)}
                          className="font-extrabold text-xs sm:text-sm text-black hover:text-orange-500 hover:underline cursor-pointer transition-colors"
                      >
                          @{thend.author.username}
                      </span>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                      {new Date(thend.created_at).toLocaleDateString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="text-gray-900 text-xs sm:text-sm leading-relaxed font-normal prose max-w-none"
                dangerouslySetInnerHTML={{ __html: thend.content }}
              />

              {thend.image_url && (
                <PostImage 
                  src={thend.image_url} 
                  onClick={() => setActiveImageUrl(thend.image_url)} 
                />
              )}

              <div className="pt-1 sm:pt-2 flex items-center gap-4 text-gray-400">
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
          );
        })
      )}

      {loading && !initialLoading && (
        <div className="p-4 bg-white border border-gray-100 rounded-2xl animate-pulse space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-xl" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-full" />
        </div>
      )}

      {activeImageUrl && (
        <div 
          onClick={() => setActiveImageUrl(null)} 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <button 
            onClick={() => setActiveImageUrl(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer z-50"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={activeImageUrl} 
            alt="Full size view" 
            className="max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain rounded-lg sm:rounded-xl select-none shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}