"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Author {
  id: number;
  username: string;
  is_active: boolean;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  author: Author;
}

interface ThendDetail {
  id: number;
  content: string;
  image_url: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
  author_id: number;
  author: Author;
  is_liked: boolean;
  comments: Comment[];
}

export default function ThendDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [thend, setThend] = useState<ThendDetail | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [commentText, setCommentText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

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
      console.error("Error fetching current user", err);
    }
  }

  async function fetchThendDetail() {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thends/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("Thend not found");
        throw new Error(`Error loading thend: ${response.status}`);
      }

      const data = await response.json();
      setThend(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCurrentUser();
    if (id) {
      fetchThendDetail();
    }
  }, [id]);

  const handleNavigationToUser = (targetUsername: string) => {
    if (targetUsername === currentUsername) {
      router.push("/profile"); 
    } else {
      router.push(`/user/${targetUsername}`); 
    }
  };

  const handleLike = async () => {
    if (!thend) return;
    
    const wasLiked = thend.is_liked;
    setThend({
      ...thend,
      is_liked: !wasLiked,
      likes_count: wasLiked ? thend.likes_count - 1 : thend.likes_count + 1,
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thends/${thend.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("You must be logged in to like thends!");
          fetchThendDetail();
          return;
        }
        throw new Error("Failed to process like");
      }

      const updatedData = await response.json();
      setThend((prev) => prev ? { ...updatedData, comments: prev.comments } : null);
    } catch (err) {
      console.error(err);
      fetchThendDetail();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !thend) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/thends/${thend.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert("You must be logged in to leave comments!");
          return;
        }
        throw new Error("Failed to submit comment");
      }

      const newComment: Comment = await response.json();

      setThend({
        ...thend,
        comments: [...thend.comments, newComment],
      });

      setCommentText("");
    } catch (err) {
      console.error(err);
      alert("Error submitting comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 font-medium">Loading thend...</div>;
  }

  if (error || !thend) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-100 rounded-2xl text-center text-red-700 font-bold">
        ❌ Error: {error || "Thend not found"}
        <button onClick={() => router.push("/")} className="block mx-auto mt-4 text-sm text-orange-500 underline">
          ← Back to Thends
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pt-6 select-none relative">
      
      <button 
        onClick={() => router.push("/")} 
        className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-orange-500 bg-white hover:bg-orange-50 px-4 py-2 rounded-xl border border-gray-200 transition-all cursor-pointer shadow-sm"
      >
        <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад в ленту
      </button>

      <article className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4 relative">

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-black shadow-sm shrink-0">
            {thend.author.username[0].toUpperCase()}
          </div>
          <div>
            <h4 
              onClick={() => handleNavigationToUser(thend.author.username)}
              className="font-extrabold text-sm text-black hover:text-orange-500 hover:underline cursor-pointer transition-colors"
            >
              @{thend.author.username}
            </h4>
            <p className="text-xs text-gray-400 font-medium">
              {new Date(thend.created_at).toLocaleDateString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
        </div>

        <div 
          className="text-gray-900 text-xs sm:text-sm leading-relaxed font-normal prose max-w-none visual-content"
          dangerouslySetInnerHTML={{ __html: thend.content }}
        />

        {thend.image_url && (
          <div 
            onClick={() => setActiveImageUrl(thend.image_url)}
            className="w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center cursor-zoom-in"
          >
            <img 
              src={thend.image_url} 
              alt="Thend attachment" 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>
        )}

        <div className="pt-2 flex items-center gap-4 text-gray-400 border-t border-gray-50">
          <button 
            onClick={handleLike}
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
        </div>
      </article>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-black tracking-tight">
          Comments ({thend.comments.length})
        </h3>

        <form onSubmit={handleCommentSubmit} className="flex gap-3 items-end bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
          <div className="flex-1">
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength={1000}
              className="w-full text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="px-4 py-2 bg-orange-500 text-black text-xs font-black rounded-xl border border-orange-600 shadow-sm hover:bg-orange-400 disabled:opacity-50 disabled:hover:bg-orange-500 transition-all cursor-pointer h-9 flex items-center justify-center"
          >
            {submitting ? "..." : "Send"}
          </button>
        </form>

        <div className="space-y-3">
          {thend.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
              Here will be the first comment! Be the first to share your thoughts.
            </div>
          ) : (
            thend.comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-gray-300 flex items-center justify-center font-bold text-xs text-black shrink-0">
                    {comment.author.username[0].toUpperCase()}
                  </div>
                  <span 
                    onClick={() => handleNavigationToUser(comment.author.username)}
                    className="font-extrabold text-xs text-black hover:text-orange-500 hover:underline cursor-pointer transition-colors"
                  >
                    @{comment.author.username}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-gray-800 text-sm pl-8 whitespace-pre-line leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {activeImageUrl && (
        <div 
          onClick={() => setActiveImageUrl(null)} 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <button 
            onClick={() => setActiveImageUrl(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img 
            src={activeImageUrl} 
            alt="Full size view" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl select-none shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}