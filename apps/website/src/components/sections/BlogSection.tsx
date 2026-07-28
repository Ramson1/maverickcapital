"use client";

import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

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
    excerpt: "High-performance blockchain achieves new throughput record as DApps and NFT markets drive massive user engagement.",
    date: "June 20, 2026",
    category: "Solana",
    image: "/blog/solana-transactions.jpg",
  },
  {
    id: 7,
    title: "Central Banks Explore Digital Currency Partnerships",
    excerpt: "Major central banks announce collaborative CBDC projects, potentially reshaping the global financial landscape.",
    date: "June 14, 2026",
    category: "CBDC",
    image: "/blog/cbdc-partnership.jpg",
  },
  {
    id: 8,
    title: "Crypto Gaming Sector Valued at $100 Billion",
    excerpt: "Play-to-earn and blockchain gaming explode in popularity, with millions of daily active users across multiple ecosystems.",
    date: "June 7, 2026",
    category: "Gaming",
    image: "/blog/crypto-gaming.jpg",
  },
  {
    id: 9,
    title: "Bitcoin Mining Goes 80% Renewable Globally",
    excerpt: "Environmental concerns addressed as renewable energy sources dominate Bitcoin mining operations worldwide.",
    date: "May 30, 2026",
    category: "Sustainability",
    image: "/blog/green-mining.jpg",
  },
  {
    id: 10,
    title: "Cross-Chain Bridges Process $50B Monthly Volume",
    excerpt: "Interoperability solutions mature as seamless asset transfers between blockchains become standard infrastructure.",
    date: "May 22, 2026",
    category: "Infrastructure",
    image: "/blog/cross-chain.jpg",
  },
  {
    id: 11,
    title: "Major Banks Launch Crypto Custody Services",
    excerpt: "Traditional financial institutions enter digital asset custody, offering institutional-grade security for crypto holdings.",
    date: "May 15, 2026",
    category: "Banking",
    image: "/blog/bank-custody.jpg",
  },
  {
    id: 12,
    title: "NFT Market Evolves Beyond Digital Art",
    excerpt: "Non-fungible tokens find utility in real estate, credentials, and supply chain management beyond collectibles.",
    date: "May 8, 2026",
    category: "NFTs",
    image: "/blog/nft-utility.jpg",
  },
  {
    id: 13,
    title: "Layer 2 Solutions Reduce Ethereum Gas Fees by 95%",
    excerpt: "Scaling breakthroughs make Ethereum transactions affordable for everyday users, driving mainstream adoption.",
    date: "April 29, 2026",
    category: "Scaling",
    image: "/blog/layer2.jpg",
  },
  {
    id: 14,
    title: "Crypto Payments Integrated by 10,000 Retailers",
    excerpt: "Major retail chains accept cryptocurrencies as payment methods, bridging the gap between digital assets and everyday commerce.",
    date: "April 20, 2026",
    category: "Payments",
    image: "/blog/crypto-payments.jpg",
  },
  {
    id: 15,
    title: "Decentralized Identity Solutions Gain Traction",
    excerpt: "Blockchain-based identity verification systems emerge as privacy-preserving alternatives to traditional KYC.",
    date: "April 12, 2026",
    category: "Identity",
    image: "/blog/did.jpg",
  },
  {
    id: 16,
    title: "Bitcoin Halving Impact Exceeds Expectations",
    excerpt: "Post-halving supply shock drives prices higher as demand continues to outpace new coin issuance.",
    date: "April 3, 2026",
    category: "Bitcoin",
    image: "/blog/halving.jpg",
  },
  {
    id: 17,
    title: "Stablecoin Market Cap Reaches $500 Billion",
    excerpt: "USDT, USDC, and other stablecoins become crucial infrastructure for global crypto markets and DeFi protocols.",
    date: "March 25, 2026",
    category: "Stablecoins",
    image: "/blog/stablecoins.jpg",
  },
  {
    id: 18,
    title: "Web3 Social Media Platforms Reach 100M Users",
    excerpt: "Decentralized social networks gain momentum as users seek data ownership and censorship resistance.",
    date: "March 16, 2026",
    category: "Web3",
    image: "/blog/web3-social.jpg",
  },
  {
    id: 19,
    title: "Crypto Insurance Protocols Expand Coverage",
    excerpt: "Decentralized insurance platforms offer comprehensive protection for DeFi positions and digital assets.",
    date: "March 8, 2026",
    category: "Insurance",
    image: "/blog/crypto-insurance.jpg",
  },
  {
    id: 20,
    title: "Institutional Crypto AUM Hits $1 Trillion",
    excerpt: "Pension funds, endowments, and sovereign wealth funds allocate significant portions to digital assets.",
    date: "February 27, 2026",
    category: "Institutional",
    image: "/blog/institutional-aum.jpg",
  },
  {
    id: 21,
    title: "Privacy Coins See Renewed Interest",
    excerpt: "Monero, Zcash, and other privacy-focused tokens gain attention as surveillance concerns grow globally.",
    date: "February 18, 2026",
    category: "Privacy",
    image: "/blog/privacy-coins.jpg",
  },
  {
    id: 22,
    title: "DAO Governance Models Evolve with New Standards",
    excerpt: "Decentralized autonomous organizations implement sophisticated voting mechanisms and treasury management.",
    date: "February 9, 2026",
    category: "DAOs",
    image: "/blog/dao-governance.jpg",
  },
  {
    id: 23,
    title: "Crypto Education Platforms Enroll 50 Million Students",
    excerpt: "Online learning initiatives drive mass adoption as understanding of blockchain technology becomes mainstream.",
    date: "January 30, 2026",
    category: "Education",
    image: "/blog/crypto-education.jpg",
  },
  {
    id: 24,
    title: "New Blockchain Consensus Mechanisms Emerge",
    excerpt: "Innovative consensus protocols promise better scalability, security, and energy efficiency for next-gen networks.",
    date: "January 20, 2026",
    category: "Technology",
    image: "/blog/consensus.jpg",
  },
  {
    id: 25,
    title: "2026: The Year Crypto Goes Mainstream",
    excerpt: "Looking back at how cryptocurrency transitioned from niche technology to essential financial infrastructure.",
    date: "January 10, 2026",
    category: "Analysis",
    image: "/blog/mainstream-2026.jpg",
  },
];

export function BlogSection({ showAll = false }: { showAll?: boolean }) {
  // Show first 3 posts on homepage, all posts on blog page
  const displayPosts = showAll ? blogPosts : blogPosts.slice(0, 3);

  return (
    <section className="relative bg-gradient-to-b from-white to-brand-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-4xl font-bold text-brand-900 md:text-5xl">
            Latest Crypto News
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Stay informed with the latest developments in cryptocurrency, blockchain technology, and digital asset markets.
          </p>
        </motion.div>

        {/* Blog Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post, index) => (
            <motion.article
              key={post.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-brand-100 transition-all hover:-translate-y-2 hover:shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="aspect-video overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">📰</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-900 transition-colors group-hover:text-brand-700">
                  {post.title}
                </h3>
                <p className="mb-4 text-sm text-slate-600">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
                >
                  Read More <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All Button - Only show on homepage */}
        {!showAll && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:shadow-xl hover:shadow-brand-500/40 hover:scale-105"
            >
              View All Articles <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
