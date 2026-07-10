"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Author {
  id: number;
  username: string;
  is_active: boolean;
}

interface Post {
  id: number;
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
  author: Author;
  is_liked: boolean;
  comments_count: number;
}

interface Channel {
  id: number;
  name: string;
  is_active: boolean;
}

function SearchPostImage({ src }: { src: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-[160px] sm:h-[220px] md:h-[280px] overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center relative select-none">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
      <img 
        src={src} 
        alt="Post preview" 
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get("q") || "";
  const activeTab = searchParams.get("tab") || "posts";

  const [posts, setPosts] = useState<Post[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);

  const switchTab = (tabName: "posts" | "channels") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabName);
    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    if (!searchQuery.trim()) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/thends/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}`,
          { credentials: "include" }
        );
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();

        if (activeTab === "posts") {
          setPosts(data.posts || []);
        } else {
          setChannels(data.channels || []);
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, activeTab]);

  return (
    <div className="w-full max-w-2xl mx-auto pt-24 pb-12 px-4 sm:px-0 space-y-6 select-none">
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Search Results for</p>
          <h1 className="text-lg sm:text-2xl font-black text-black truncate">“{searchQuery}”</h1>
        </div>
        <button 
          onClick={() => router.push("/dashboard")} 
          className="text-xs font-black text-gray-500 hover:text-black bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
        >
          To Dashboard
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => switchTab("posts")}
          className={`flex-1 py-3 text-center font-black text-sm transition-all border-b-2 cursor-pointer
            ${activeTab === "posts" 
              ? "border-orange-500 text-black text-base" 
              : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
        >
          📝 Posts
        </button>
        <button
          onClick={() => switchTab("channels")}
          className={`flex-1 py-3 text-center font-black text-sm transition-all border-b-2 cursor-pointer
            ${activeTab === "channels" 
              ? "border-orange-500 text-black text-base" 
              : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
        >
          📺 Channels
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center text-gray-400 font-medium text-sm gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          Searching in the database...
        </div>
      ) : (
        <div className="space-y-4">
          
          {activeTab === "posts" && (
            posts.length > 0 ? (
              posts.map((post) => (
                <article 
                  key={post.id} 
                  onClick={() => router.push(`/thend/${post.id}`)}
                  className="p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3 sm:space-y-4 hover:border-orange-500/40 transition-all duration-300 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-black text-sm sm:text-base shadow-sm shrink-0">
                        {post.author.username[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-xs sm:text-sm text-black transition-colors">
                          @{post.author.username}
                        </span>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                          {new Date(post.created_at).toLocaleDateString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="text-gray-900 text-xs sm:text-sm leading-relaxed font-normal prose max-w-none line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {post.image_url && (
                    <SearchPostImage src={post.image_url} />
                  )}

                  <div className="pt-1 flex items-center gap-4 text-gray-400 text-xs font-bold border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{post.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.comments_count}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-center py-12 text-gray-400 text-sm font-medium">No posts found for your search query</p>
            )
          )}

          {activeTab === "channels" && (
            channels.length > 0 ? (
              <div className="flex flex-col gap-3 w-full">
                {channels.map((channel) => (
                  <div 
                    key={channel.id} 
                    onClick={() => router.push(`/user/${channel.name}`)}
                    className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between hover:border-orange-500/40 transition-all duration-300 hover:shadow-md cursor-pointer w-full"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500 border border-orange-600 font-black text-black flex items-center justify-center text-sm sm:text-base shadow-sm shrink-0">
                        {channel.name[0].toUpperCase()}
                      </div>
                      <div className="font-extrabold text-black text-xs sm:text-sm">@{channel.name}</div>
                    </div>
                    <span className="text-[9px] sm:text-[10px] bg-gray-100 px-2.5 py-1 rounded-lg text-gray-500 font-bold uppercase tracking-wider shrink-0">
                      Channel
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-gray-400 text-sm font-medium">Channels with such a name not found</p>
            )
          )}

        </div>
      )}
    </div>
  );
}