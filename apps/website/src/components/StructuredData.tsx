export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Maverick Capital",
    "url": "https://maverickcapital.com",
    "logo": "https://maverickcapital.com/logo.png",
    "description": "Professional investment and trading platform offering expert-managed portfolios across Gold, Cryptocurrency, Forex, and Indices markets.",
    "email": "Maverikcapital@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Marina Road, Lagos Island",
      "addressLocality": "Lagos",
      "addressCountry": "NG"
    },
    "sameAs": [
      "https://www.facebook.com/maverickcapital",
      "https://www.twitter.com/maverickcapital",
      "https://www.instagram.com/maverickcapital",
      "https://www.linkedin.com/company/maverickcapital"
    ],
    "serviceType": [
      "Gold Trading",
      "Cryptocurrency Trading",
      "Forex Trading",
      "Indices Trading",
      "Investment Management"
    ],
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Investment Plans",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Standard Plan",
            "description": "3-month capital lock with 10% return, minimum $50 investment, profits withdrawable anytime"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Premium Plan",
            "description": "6-month capital lock with 15% return, minimum $200 investment, profits withdrawable anytime"
          }
        }
      ]
    }
  };

  return <JsonLd data={schema} />;
}

export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Maverick Capital?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Maverick Capital is a professional investment and trading platform offering expert-managed portfolios across Gold, Cryptocurrency, Forex, and Indices markets. We provide investment plans targeting 10% monthly returns."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum investment amount?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our Starter Plan begins at $100, making professional investment management accessible to everyone. We offer four tiers: Starter ($100), Growth ($1,000), Professional ($10,000), and Elite ($50,000)."
        }
      },
      {
        "@type": "Question",
        "name": "What returns can I expect?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We target 10% monthly returns across all investment tiers through expert portfolio management. However, please note that all investments carry risk, and past performance does not guarantee future results."
        }
      },
      {
        "@type": "Question",
        "name": "What markets do you trade in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We trade across four major markets: Gold, Cryptocurrency (spot and futures), Forex, and Indices. All transactions are conducted in USDT for consistency and stability."
        }
      },
      {
        "@type": "Question",
        "name": "How do I get started?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply create an account, choose your investment plan, fund your account with USDT, and our expert traders will begin managing your portfolio immediately."
        }
      },
      {
        "@type": "Question",
        "name": "Is my investment secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, all investments carry inherent market risks that you should understand before investing."
        }
      }
    ]
  };

  return <JsonLd data={schema} />;
}

export function BlogPostSchema({ 
  title, 
  excerpt, 
  date, 
  category,
  id 
}: { 
  title: string; 
  excerpt: string; 
  date: string; 
  category: string;
  id: number;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": excerpt,
    "datePublished": date,
    "dateModified": date,
    "author": {
      "@type": "Organization",
      "name": "Maverick Capital"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Maverick Capital",
      "logo": {
        "@type": "ImageObject",
        "url": "https://maverickcapital.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://maverickcapital.com/blog/${id}`
    },
    "keywords": category,
    "articleSection": category,
    "inLanguage": "en-US"
  };

  return <JsonLd data={schema} />;
}

export function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Investment Management",
    "provider": {
      "@type": "FinancialService",
      "name": "Maverick Capital",
      "url": "https://maverickcapital.com"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Trading Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Gold Trading",
            "description": "Professional gold trading and investment services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cryptocurrency Trading",
            "description": "Expert cryptocurrency spot and futures trading"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Forex Trading",
            "description": "Professional forex trading across major currency pairs"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Indices Trading",
            "description": "Strategic trading on major market indices"
          }
        }
      ]
    }
  };

  return <JsonLd data={schema} />;
}
