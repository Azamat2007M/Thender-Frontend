"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  text: string;
  created_at: string;
  sender_id: number;
}

interface Chat {
  id: number;
  user_one_id: number;
  user_two_id: number;
  created_at: string;
  messages: Message[];
}

export default function DashboardChats() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [usernames, setUsernames] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchMyChats = async () => {
      try {
        const userRes = await fetch("http://localhost:8000/users/me", { credentials: "include" });
        let myId: number | null = null;
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUserId(userData.id);
          myId = userData.id;
        }

        if (!myId) return;

        const res = await fetch("http://localhost:8000/chats/my-chats", {
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
        });

        if (res.ok) {
          const chatData: Chat[] = await res.json();
          setChats(chatData);

          const companionIds = Array.from(
            new Set(
              chatData.map((chat) =>
                chat.user_one_id === myId ? chat.user_two_id : chat.user_one_id
              )
            )
          );

          const userMap: { [key: number]: string } = {};
          await Promise.all(
            companionIds.map(async (id) => {
              try {
                const uRes = await fetch(`http://localhost:8000/users/${id}`, { credentials: "include" });
                if (uRes.ok) {
                  const uData = await uRes.json();
                  userMap[id] = uData.username;
                } else {
                  userMap[id] = `User #${id}`;
                }
              } catch {
                userMap[id] = `User #${id}`;
              }
            })
          );

          setUsernames(userMap);
        }
      } catch (err) {
        console.error("Error fetching my chats or users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyChats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-100 rounded-3xl p-4 shadow-sm select-none">
      <div className="mb-4 px-2">
        <h2 className="text-base font-black text-gray-900">Your Chats</h2>
        <p className="text-xs text-gray-400 font-medium">History of conversations with friends in real-time</p>
      </div>

      <div className="space-y-1.5">
        {chats.length === 0 ? (
          <div className="text-center py-10 px-4">
            <p className="text-xs text-gray-400 font-medium">
              You don't have any active chats yet. Go to a friend's profile to start a conversation!
            </p>
          </div>
        ) : (
          chats.map((chat) => {
            const lastMessage = chat.messages[chat.messages.length - 1];
            
            const messageTime = lastMessage 
              ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "";

            const companionId = chat.user_one_id === currentUserId ? chat.user_two_id : chat.user_one_id;
            const companionName = usernames[companionId] || `User #${companionId}`;
            const firstLetter = companionName[0]?.toUpperCase() || "U";

            return (
              <div
                key={chat.id}
                onClick={() => router.push(`/chats/${chat.id}`)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 active:bg-gray-100/70 cursor-pointer transition-all border border-transparent hover:border-gray-100/50 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  
                  <div className="w-11 h-11 bg-gradient-to-tr from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-black font-black text-sm shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    {firstLetter}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-sm font-black text-gray-900 group-hover:text-orange-600 transition-colors truncate tracking-tight">
                        {companionName}
                      </h4>
                      {messageTime && (
                        <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap font-mono">
                          {messageTime}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate mt-0.5 font-medium max-w-[90%]">
                      {lastMessage ? (
                        <>
                          <span className="font-bold text-gray-700">
                            {lastMessage.sender_id === currentUserId ? "You: " : ""}
                          </span>
                          {lastMessage.text}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No messages</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-gray-300 group-hover:text-orange-500 font-bold pl-2 transition-colors text-sm">
                  →
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}