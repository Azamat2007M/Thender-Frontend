"use client";

import { useTab } from "@/app/context/TabContext";


export default function DashboardPage() {
  const { activeTab } = useTab();

  const samplePosts = [
    {
      id: 1,
      author: "alex_thunder",
      content: "Just deployment-testing the newly structured Next.js 15 front-end engine for Thender. Built with App Router and Tailwind CSS v4. Clean architecture feels incredible.",
      time: "2 hours ago",
    },
    {
      id: 2,
      author: "dev_polytech",
      content: "Spent the evening optimizing backend data automations on Python. Ready to hook up the CRUD routers to our Postgres instances via Docker compose tomorrow.",
      time: "5 hours ago",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      
      {activeTab === "feed" && (
        <>
          <h2 className="text-2xl font-black tracking-tight text-black">Global Feed</h2>
          {samplePosts.map((post) => (
            <article 
              key={post.id} 
              className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4 hover:border-orange-500/40 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 border border-orange-600 flex items-center justify-center font-black text-black shadow-sm">
                    {post.author[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-black">@{post.author}</h4>
                    <p className="text-xs text-gray-400 font-medium">{post.time}</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line font-normal">
                {post.content}
              </p>
            </article>
          ))}
        </>
      )}

      {activeTab === "create" && (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-2xl font-black tracking-tight text-black">Create New Spark</h2>
          <textarea
            placeholder="What's engineering in your mind today?..."
            className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white text-sm text-black transition-all resize-none placeholder:text-gray-400 font-medium"
          />
          <button className="px-6 h-11 bg-black hover:bg-gray-900 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-md">
            Publish Post
          </button>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm text-center space-y-2">
          <h2 className="text-2xl font-black text-black">Messages Matrix</h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">
            Real-time chat infrastructure via secure websocket connections is loading.
          </p>
        </div>
      )}

      {activeTab === "support" && (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-black">Report & Feedback</h2>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
              Your message will be securely routed directly to our Telegram support channel.
            </p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); alert('Routing data to Telegram...'); }} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">Message Type</label>
              <select className="w-full h-11 px-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 text-sm font-bold text-black cursor-pointer">
                <option>Suggestion / Feature Idea</option>
                <option>Platform Complain / Bug</option>
                <option>Other / Urgent Request</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                required
                placeholder="Explain your situation or proposal in detail..."
                className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white text-sm text-black transition-all resize-none placeholder:text-gray-400 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              Send to Telegram Support
            </button>
          </form>
        </div>
      )}

    </div>
  );
}