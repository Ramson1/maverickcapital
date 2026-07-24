"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pin, Bookmark, BookmarkCheck, Clock, ArrowRight } from "lucide-react";

const mockNews = [
  { id: "1", title: "Platform Maintenance Scheduled for July 30", body: "We will be performing scheduled maintenance on July 30 from 02:00 to 06:00 UTC. During this time, the platform may be temporarily unavailable.", category: "Maintenance", image: null, isPinned: true, date: "2026-07-25", author: "System" },
  { id: "2", title: "New Investment Plan: Elite Tier Now Available", body: "We're excited to announce our new Elite investment tier with up to 40% annual returns. Minimum investment of $100,000.", category: "Announcement", image: null, isPinned: true, date: "2026-07-22", author: "Admin" },
  { id: "3", title: "Market Update: Bitcoin Breaks $70K Resistance", body: "Bitcoin has successfully broken through the $70,000 resistance level, signaling strong bullish momentum for the coming weeks.", category: "Market News", image: null, isPinned: false, date: "2026-07-24", author: "Analyst" },
  { id: "4", title: "Summer Promotion: 0% Deposit Fees", body: "For the month of August, we're waiving all deposit fees. Fund your account without any additional charges.", category: "Promotions", image: null, isPinned: false, date: "2026-07-20", author: "Admin" },
  { id: "5", title: "Investment Update: Q2 Performance Review", body: "Our Q2 investment plans have delivered an average return of 12.5%, exceeding market benchmarks by 8%.", category: "Investment Updates", image: null, isPinned: false, date: "2026-07-18", author: "Analyst" },
];

const categories = ["All", "Announcement", "Maintenance", "Investment Updates", "Market News", "Promotions"];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = mockNews.filter((n) => selectedCategory === "All" || n.category === selectedCategory);
  const pinned = filtered.filter((n) => n.isPinned);
  const regular = filtered.filter((n) => !n.isPinned);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">News</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">Stay updated with the latest news and announcements</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", selectedCategory === cat ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "text-surface-500 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800")}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {[...pinned, ...regular].map((news) => (
          <Card key={news.id} className={cn("transition-colors", news.isPinned && "border-accent-200 dark:border-accent-800")}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {news.isPinned && <Pin className="h-3.5 w-3.5 text-accent-600 dark:text-accent-400" />}
                    <Badge variant="secondary">{news.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-surface-500"><Clock className="h-3 w-3" />{new Date(news.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-surface-900 dark:text-white">{news.title}</h3>
                  <p className={cn("mt-2 text-sm text-surface-600 dark:text-surface-400", expandedId !== news.id && "line-clamp-2")}>
                    {news.body}
                  </p>
                  <button onClick={() => setExpandedId(expandedId === news.id ? null : news.id)} className="mt-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    {expandedId === news.id ? "Show less" : "Read more"}
                  </button>
                </div>
                <button onClick={() => toggleBookmark(news.id)} className="ml-4 shrink-0">
                  {bookmarked.includes(news.id) ? <BookmarkCheck className="h-5 w-5 text-brand-600" /> : <Bookmark className="h-5 w-5 text-surface-400" />}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
