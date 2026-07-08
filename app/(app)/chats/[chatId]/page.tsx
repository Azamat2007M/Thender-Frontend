"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  text: string;
  created_at: string;
}

interface Companion {
  id: number;
  username: string;
  is_active?: boolean;
}

export default function ChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function initChat() {
      try {
        const userRes = await fetch("http://localhost:8000/users/me", { credentials: "include" }); 
        let myId: number | null = null;
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUserId(userData.id);
          myId = userData.id;
        }

        const chatRes = await fetch("http://localhost:8000/chats/my-chats", { credentials: "include" });
        if (chatRes.ok && myId) {
          const chats = await chatRes.json();
          const currentChat = chats.find((c: any) => c.id === Number(chatId));
          
          if (currentChat) {
            if (currentChat.messages) {
              setMessages(currentChat.messages);
            }
            
            const companionId = currentChat.user_one_id === myId 
              ? currentChat.user_two_id 
              : currentChat.user_one_id;

            const companionRes = await fetch(`http://localhost:8000/users/${companionId}`, { credentials: "include" });
            if (companionRes.ok) {
              const companionData = await companionRes.json();
              setCompanion(companionData);
            } else {
              setCompanion({ id: companionId, username: `User #${companionId}` });
            }
          }
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
      } finally {
        setLoading(false);
      }
    }

    if (chatId && chatId !== "undefined") {
      initChat();
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId || chatId === "undefined" || !currentUserId) return;
    if (socketRef.current) return;

    const wsUrl = `ws://localhost:8000/chats/ws/${chatId}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Connected to chat #${chatId}`);
    };

    ws.onmessage = (event) => {
      try {
        const incomingMessage: Message = JSON.parse(event.data);
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === incomingMessage.id)) return prev;
          return [...prev, incomingMessage];
        });
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    ws.onclose = () => {
      socketRef.current = null;
    };

    ws.onerror = () => {
      console.warn("[WS] Connection state notification.");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
        socketRef.current = null;
      }
    };
  }, [chatId, currentUserId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current || !currentUserId) return;

    if (socketRef.current.readyState !== WebSocket.OPEN) return;

    const payload = {
      sender_id: currentUserId,
      text: inputText.trim()
    };

    socketRef.current.send(JSON.stringify(payload));
    setInputText("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-400 font-bold animate-pulse text-xs">
        Loading real-time secure chat...
      </div>
    );
  }

  const isOnline = companion?.is_active ?? true; 

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 select-none">
      <button 
        onClick={() => router.back()} 
        className="text-sm font-bold text-gray-500 hover:text-black transition-colors cursor-pointer"
      >
        ← Back to Dashboard
      </button>

      <div className="flex flex-col h-[75vh] bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          {companion ? (
            <Link 
              href={`/user/${companion.username}`}
              className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-black font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                {companion.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-900 tracking-tight group-hover:text-orange-600 transition-colors">
                  {companion.username}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                  <p className="text-[10px] text-gray-400 font-bold tracking-tight uppercase">
                    {isOnline ? "activated" : ""}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="space-y-1">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-2 w-12 bg-gray-200 rounded" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-gray-50/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <span className="text-2xl">✨</span>
              <p className="text-xs text-gray-400 font-bold max-w-xs leading-relaxed">
                This is the beginning of your conversation with {companion?.username}.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id || index}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 text-sm rounded-2xl shadow-sm transition-all ${
                      isMe
                        ? "bg-orange-500 text-black font-medium rounded-tr-none"
                        : "bg-white text-gray-900 border border-gray-200 rounded-tl-none"
                    }`}
                  >
                    <p className="break-words leading-relaxed font-normal">{msg.text}</p>
                    <span
                      className={`block text-[9px] text-right mt-1 font-mono font-bold ${
                        isMe ? "text-black/50" : "text-gray-400"
                      }`}
                    >
                      {msg.created_at 
                        ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-orange-500/40 focus-within:bg-white transition-all duration-200">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-black font-black text-xs rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}