"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pin, Bookmark, BookmarkCheck, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { TablePageSkeleton } from "@/components/ui/PageSkeletons";

interface NewsItem {
  id: string;
  title: string;
  body: string;
  category: string;
  image_url: string | null;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
}

const categories = ["All", "Announcement", "Maintenance", "Investment Updates", "Market News", "Promotions"];

export default function NewsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch published news
      const { data: newsData } = await supabase
        .from("mc_news")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });

      if (newsData) setNews(newsData);

      // Fetch bookmarks if user is logged in
      if (user) {
        const { data: bookmarkData } = await supabase
          .from("mc_news_bookmarks")
          .select("news_id")
          .eq("user_id", user.id);

        if (bookmarkData) setBookmarked(bookmarkData.map((b) => b.news_id));
      }

      setLoading(false);
    };

    fetchData();
  }, [user, supabase]);

  const filtered = news.filter((n) => selectedCategory === "All" || n.category.toLowerCase() === selectedCategory.toLowerCase());
  const pinned = filtered.filter((n) => n.is_pinned);
  const regular = filtered.filter((n) => !n.is_pinned);

  const toggleBookmark = async (id: string) => {
    if (!user) return;

    const isBookmarked = bookmarked.includes(id);

    if (isBookmarked) {
      await supabase.from("mc_news_bookmarks").delete().eq("user_id", user.id).eq("news_id", id);
      setBookmarked((prev) => prev.filter((b) => b !== id));
    } else {
      await supabase.from("mc_news_bookmarks").insert({ user_id: user.id, news_id: id });
      setBookmarked((prev) => [...prev, id]);
    }
  };

  if (loading) {
    return <TablePageSkeleton />;
  }

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
        {[...pinned, ...regular].length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-surface-500">No news articles found</p>
          </div>
        ) : (
          [...pinned, ...regular].map((item) => (
            <Card key={item.id} className={cn("transition-colors", item.is_pinned && "border-accent-200 dark:border-accent-800")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.is_pinned && <Pin className="h-3.5 w-3.5 text-accent-600 dark:text-accent-400" />}
                      <Badge variant="secondary">{item.category}</Badge>
                      <span className="flex items-center gap-1 text-xs text-surface-500">
                        <Clock className="h-3 w-3" />
                        {new Date(item.published_at || item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">{item.title}</h3>
                    <p className={cn("mt-2 text-sm text-surface-600 dark:text-surface-400", expandedId !== item.id && "line-clamp-2")}>
                      {item.body}
                    </p>
                    <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="mt-2 text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400">
                      {expandedId === item.id ? "Show less" : "Read more"}
                    </button>
                  </div>
                  {user && (
                    <button onClick={() => toggleBookmark(item.id)} className="ml-4 shrink-0">
                      {bookmarked.includes(item.id) ? <BookmarkCheck className="h-5 w-5 text-brand-600" /> : <Bookmark className="h-5 w-5 text-surface-400" />}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
