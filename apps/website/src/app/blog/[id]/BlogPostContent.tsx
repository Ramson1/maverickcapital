"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, ArrowLeft, Share2, Check, ArrowUp } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  content: string;
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* Back button */}
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Articles
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-4">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700">
            {post.category}
          </span>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-brand-950 sm:text-5xl">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{post.date}</span>
          </div>
        </div>
      </header>

      {/* Featured image placeholder */}
      <div className="mb-10 h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 sm:h-96">
        <div className="flex h-full items-center justify-center">
          <span className="text-8xl opacity-20">📰</span>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {post.content.split("\n\n").map((paragraph, index) => {
          if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
            return (
              <h2
                key={index}
                className="mb-4 mt-8 text-2xl font-bold text-brand-950"
              >
                {paragraph.replace(/\*\*/g, "")}
              </h2>
            );
          }
          if (paragraph.startsWith("- ")) {
            const items = paragraph
              .split("\n")
              .filter((line) => line.startsWith("- "));
            return (
              <ul key={index} className="mb-6 space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="text-slate-600">
                    {item.replace("- ", "")}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={index} className="mb-6 leading-relaxed text-slate-600">
              {paragraph}
            </p>
          );
        })}
      </div>

      {/* Share section */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            Share this article
          </p>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share
              </>
            )}
          </button>
        </div>
      </div>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-6 bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all hover:bg-brand-700 hover:shadow-xl"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </article>
  );
}
