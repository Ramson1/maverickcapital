"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const blogPosts = [
  {
    id: 1,
    title: "Bitcoin Surges Past $150K as Institutional Adoption Accelerates",
    excerpt: "Bitcoin reaches new all-time high as major corporations add BTC to their treasury reserves, signaling unprecedented institutional confidence.",
    date: "July 23, 2026",
    category: "Bitcoin",
    image: "/blog/bitcoin-150k.jpg",
  },
  {
    id: 2,
    title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
    excerpt: "ETH stakers enjoy highest yields since the merge as network activity surges and DeFi protocols expand across multiple chains.",
    date: "July 18, 2026",
    category: "Ethereum",
    image: "/blog/ethereum-staking.jpg",
  },
  {
    id: 3,
    title: "SEC Approves New Crypto ETFs for Retail Investors",
    excerpt: "Regulatory breakthrough as SEC greenlights multiple cryptocurrency ETFs, making digital assets accessible to mainstream investors.",
    date: "July 12, 2026",
    category: "Regulation",
    image: "/blog/sec-etf.jpg",
  },
  {
    id: 4,
    title: "DeFi Total Value Locked Exceeds $500 Billion",
    excerpt: "Decentralized finance ecosystem reaches new milestone as yield farming and liquidity mining attract unprecedented capital inflows.",
    date: "July 5, 2026",
    category: "DeFi",
    image: "/blog/defi-tvl.jpg",
  },
  {
    id: 5,
    title: "Cyprus Emerges as European Crypto Hub with New Framework",
    excerpt: "Cypriot government introduces comprehensive crypto regulations, positioning the country as a European leader in digital asset innovation.",
    date: "June 28, 2026",
    category: "Adoption",
    image: "/blog/cyprus-crypto.jpg",
  },
  {
    id: 6,
    title: "Solana Network Processes 100 Million Transactions Daily",
    excerpt: "High-performance blockchain achieves new milestone as ecosystem growth accelerates with institutional partnerships and dApp expansion.",
    date: "June 20, 2026",
    category: "Blockchain",
    image: "/blog/solana-transactions.jpg",
  },
  {
    id: 7,
    title: "Central Banks Accelerate CBDC Development Worldwide",
    excerpt: "Over 90 countries now exploring digital currencies as Federal Reserve and ECB announce pilot programs for digital dollar and euro.",
    date: "June 15, 2026",
    category: "Regulation",
    image: "/blog/cbdc-development.jpg",
  },
  {
    id: 8,
    title: "Cross-Chain Bridges Process $1 Trillion in Volume",
    excerpt: "Interoperability solutions gain traction as cross-chain infrastructure matures, enabling seamless asset transfers between blockchains.",
    date: "June 8, 2026",
    category: "DeFi",
    image: "/blog/cross-chain.jpg",
  },
  {
    id: 9,
    title: "Crypto Wallet Adoption Reaches 500 Million Users Globally",
    excerpt: "Mainstream adoption accelerates as user-friendly wallets and institutional custody solutions attract new participants to digital assets.",
    date: "June 1, 2026",
    category: "Adoption",
    image: "/blog/wallet-adoption.jpg",
  },
  {
    id: 10,
    title: "Layer 2 Solutions Reduce Ethereum Gas Fees by 95%",
    excerpt: "Scaling innovations make Ethereum accessible to retail users as transaction costs plummet and throughput increases dramatically.",
    date: "May 25, 2026",
    category: "Ethereum",
    image: "/blog/layer2-scaling.jpg",
  },
  {
    id: 11,
    title: "Institutional Crypto Holdings Surpass $1 Trillion",
    excerpt: "Pension funds, endowments, and corporations increase Bitcoin and Ethereum allocations as digital assets become mainstream portfolio components.",
    date: "May 18, 2026",
    category: "Bitcoin",
    image: "/blog/institutional-holdings.jpg",
  },
  {
    id: 12,
    title: "NFT Market Evolves Beyond Digital Art",
    excerpt: "Real-world asset tokenization and utility-focused NFTs drive next wave of blockchain adoption across finance, gaming, and real estate.",
    date: "May 10, 2026",
    category: "NFT",
    image: "/blog/nft-evolution.jpg",
  },
  {
    id: 13,
    title: "Decentralized Identity Solutions Gain Traction",
    excerpt: "Self-sovereign identity protocols emerge as privacy concerns grow, offering users control over personal data without sacrificing compliance.",
    date: "May 3, 2026",
    category: "Blockchain",
    image: "/blog/decentralized-identity.jpg",
  },
  {
    id: 14,
    title: "Crypto Payments Integrated by Major Retailers",
    excerpt: "Walmart, Amazon, and Target announce Bitcoin payment support as cryptocurrency becomes viable alternative to traditional payment methods.",
    date: "April 25, 2026",
    category: "Adoption",
    image: "/blog/retail-payments.jpg",
  },
  {
    id: 15,
    title: "Green Mining Initiatives Transform Bitcoin Network",
    excerpt: "Renewable energy mining operations expand as environmental concerns drive sustainable blockchain infrastructure development.",
    date: "April 18, 2026",
    category: "Bitcoin",
    image: "/blog/green-mining.jpg",
  },
  {
    id: 16,
    title: "Yield Aggregators Optimize DeFi Returns",
    excerpt: "Automated yield optimization protocols help investors maximize returns across multiple DeFi platforms with minimal effort.",
    date: "April 10, 2026",
    category: "DeFi",
    image: "/blog/yield-aggregators.jpg",
  },
  {
    id: 17,
    title: "Privacy Coins Face Increased Regulatory Scrutiny",
    excerpt: "Governments worldwide examine privacy-focused cryptocurrencies as compliance requirements tighten across the digital asset ecosystem.",
    date: "April 3, 2026",
    category: "Regulation",
    image: "/blog/privacy-coins.jpg",
  },
  {
    id: 18,
    title: "Smart Contract Audits Become Industry Standard",
    excerpt: "Security firms report record demand as DeFi protocols prioritize comprehensive audits to protect user funds and build trust.",
    date: "March 25, 2026",
    category: "Security",
    image: "/blog/smart-contract-audits.jpg",
  },
  {
    id: 19,
    title: "Crypto Education Platforms Expand Globally",
    excerpt: "Online learning initiatives democratize blockchain knowledge as universities and private companies launch comprehensive certification programs.",
    date: "March 18, 2026",
    category: "Education",
    image: "/blog/crypto-education.jpg",
  },
  {
    id: 20,
    title: "Stablecoin Market Cap Exceeds $300 Billion",
    excerpt: "Digital dollars gain mainstream adoption as payment processors, merchants, and DeFi protocols integrate USDC and USDT at scale.",
    date: "March 10, 2026",
    category: "Stablecoins",
    image: "/blog/stablecoin-growth.jpg",
  },
  {
    id: 21,
    title: "Blockchain Gaming Attracts 100 Million Players",
    excerpt: "Play-to-earn and play-and-own models revolutionize gaming industry as traditional publishers enter blockchain space with AAA titles.",
    date: "March 3, 2026",
    category: "Gaming",
    image: "/blog/blockchain-gaming.jpg",
  },
  {
    id: 22,
    title: "DAO Governance Models Mature and Evolve",
    excerpt: "Decentralized autonomous organizations implement sophisticated voting mechanisms and treasury management strategies for long-term sustainability.",
    date: "February 25, 2026",
    category: "DAO",
    image: "/blog/dao-governance.jpg",
  },
  {
    id: 23,
    title: "Crypto Insurance Protocols Protect Digital Assets",
    excerpt: "Decentralized insurance solutions emerge to cover smart contract risks, exchange failures, and market volatility for institutional investors.",
    date: "February 18, 2026",
    category: "DeFi",
    image: "/blog/crypto-insurance.jpg",
  },
  {
    id: 24,
    title: "Emerging Markets Lead Crypto Adoption",
    excerpt: "Developing nations embrace cryptocurrencies for remittances, inflation hedging, and financial inclusion as traditional banking remains inaccessible.",
    date: "February 10, 2026",
    category: "Adoption",
    image: "/blog/emerging-markets.jpg",
  },
  {
    id: 25,
    title: "Bitcoin Lightning Network Capacity Doubles",
    excerpt: "Layer 2 payment channel expands rapidly as merchants and users adopt instant, low-fee Bitcoin transactions for everyday purchases.",
    date: "February 3, 2026",
    category: "Bitcoin",
    image: "/blog/lightning-network.jpg",
  },
  {
    id: 26,
    title: "Interoperability Protocols Connect Major Blockchains",
    excerpt: "Cross-chain communication standards enable seamless data and asset transfer between Ethereum, Solana, Cardano, and other major networks.",
    date: "January 25, 2026",
    category: "Blockchain",
    image: "/blog/interoperability.jpg",
  },
];

const categories = [
  "All",
  "Bitcoin",
  "Ethereum",
  "DeFi",
  "Regulation",
  "Adoption",
  "Blockchain",
  "NFT",
  "Security",
  "Education",
  "Stablecoins",
  "Gaming",
  "DAO",
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white to-brand-50 pt-24">
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Header */}
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 text-4xl font-bold text-brand-900 md:text-5xl">
              Latest Crypto News
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Stay informed with the latest developments in cryptocurrency,
              blockchain technology, and digital asset markets.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            className="mb-10 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-2 border-brand-200 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                    selectedCategory === category
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-700"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            className="mb-6 text-center text-sm text-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Showing {filteredPosts.length} of {blogPosts.length} articles
          </motion.div>

          {/* Blog Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={`/blog/${post.id}`} className="block h-full">
                  <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-brand-100 transition-all hover:-translate-y-2 hover:shadow-2xl">
                    {/* Image placeholder */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-20">📰</span>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-700 backdrop-blur-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{post.date}</span>
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-brand-900 transition-colors group-hover:text-brand-600">
                        {post.title}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition-all group-hover:gap-3">
                        Read More <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <motion.div
              className="py-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-lg text-slate-600">
                No articles found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
