"use client";

import CreateThend from "@/app/components/CreateThend";
import ThendsChat from "@/app/components/ThendChat";
import ThendsFeed from "@/app/components/ThendsFeed";
import ThendsSupport from "@/app/components/ThendsSupport";
import { useTab } from "@/app/context/TabContext";

export default function DashboardPage() {
  const { activeTab } = useTab();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {activeTab === "feed" && <ThendsFeed />}
      {activeTab === "create" && <CreateThend />}
      {activeTab === "chat" && <ThendsChat />}
      {activeTab === "support" && <ThendsSupport />}
    </div>
  );
}