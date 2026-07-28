"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Investment Plans", href: "/plans" },
    { label: "Market", href: "/market" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
    { label: "Gold Trading", href: "/services" },
    { label: "Crypto Spot Trading", href: "/services" },
    { label: "Crypto Futures", href: "/services" },
    { label: "Forex Trading", href: "/services" },
    { label: "Indices Trading", href: "/services" },
  ],
  legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Risk Disclosure", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const legalModals: Record<string, { title: string; content: string }> = {
    "Terms of Service": {
      title: "Terms of Service",
      content: `Last Updated: July 2026

Welcome to Maverick Capital. By accessing or using our platform, you agree to be bound by these Terms of Service.

1. ELIGIBILITY
You must be at least 18 years old and have the legal capacity to enter into binding agreements to use our services.

2. ACCOUNT REGISTRATION
You must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials.

3. INVESTMENT SERVICES
Maverick Capital provides professional investment management services across Gold, Cryptocurrency, Forex, and Indices markets. All investments are made in USDT.

4. RETURNS AND RISKS
While we target 10% monthly returns, investment involves risk. Past performance does not guarantee future results. You should only invest funds you can afford to lose.

5. PROHIBITED ACTIVITIES
You may not use our platform for money laundering, terrorist financing, or any illegal activities.

6. TERMINATION
We reserve the right to suspend or terminate your account for violation of these terms.

7. LIMITATION OF LIABILITY
Maverick Capital shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.

8. GOVERNING LAW
These terms are governed by the laws of the Republic of Cyprus.

For questions about these Terms, contact us at legal@maverickcapital.com.`,
    },
    "Privacy Policy": {
      title: "Privacy Policy",
      content: `Last Updated: July 2026

Maverick Capital is committed to protecting your privacy and personal information.

1. INFORMATION WE COLLECT
We collect personal information including name, email address, phone number, identification documents, and financial information necessary for KYC/AML compliance.

2. HOW WE USE YOUR INFORMATION
- Provide and improve our services
- Process transactions and payments
- Comply with legal and regulatory requirements
- Communicate with you about your account
- Prevent fraud and enhance security

3. DATA SHARING
We do not sell your personal information. We may share data with:
- Regulatory authorities as required by law
- Service providers who assist our operations
- Payment processors for transaction handling

4. DATA SECURITY
We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your information.

5. DATA RETENTION
We retain your information for as long as your account is active or as needed to provide services, comply with legal obligations, and resolve disputes.

6. YOUR RIGHTS
You have the right to access, correct, or delete your personal information. Contact us at privacy@maverickcapital.com.

7. COOKIES
We use cookies to enhance your browsing experience. See our Cookie Policy for details.

8. CHANGES TO THIS POLICY
We may update this policy periodically. We will notify you of significant changes.

For privacy concerns, contact our Data Protection Officer at privacy@maverickcapital.com.`,
    },
    "Risk Disclosure": {
      title: "Risk Disclosure",
      content: `Last Updated: July 2026

IMPORTANT: Investing in financial markets involves substantial risk of loss and is not suitable for all investors.

1. MARKET RISK
Financial markets are volatile and unpredictable. The value of investments can fluctuate, and you may lose some or all of your invested capital.

2. NO GUARANTEES
While Maverick Capital targets 10% monthly returns through expert portfolio management, these returns are not guaranteed. Past performance does not indicate future results.

3. LEVERAGE RISK
Trading with leverage amplifies both gains and losses. You may lose more than your initial investment.

4. CRYPTOCURRENCY RISK
Digital assets are highly volatile and subject to rapid price changes. Cryptocurrency markets operate 24/7 and can be affected by technological, regulatory, and market factors.

5. FOREIGN EXCHANGE RISK
Currency values fluctuate due to economic, political, and market conditions. Forex trading carries significant risk.

6. LIQUIDITY RISK
Some investments may be difficult to sell or convert to cash quickly, especially during market stress.

7. REGULATORY RISK
Changes in laws, regulations, or government policies may adversely affect your investments.

8. CYBERSECURITY RISK
Despite our robust security measures, digital platforms face cybersecurity threats including hacking, phishing, and technical failures.

9. YOUR RESPONSIBILITY
You should:
- Only invest funds you can afford to lose
- Diversify your investments
- Seek independent financial advice if needed
- Understand the products you're investing in
- Never invest based on pressure or urgency

10. ACKNOWLEDGMENT
By using our services, you acknowledge that you understand the risks involved and have made an independent decision to invest with Maverick Capital.

This disclosure does not disclose all risks. For comprehensive risk assessment, consult with a financial advisor.

Contact our Risk Management team at risk@maverickcapital.com.`,
    },
    "Cookie Policy": {
      title: "Cookie Policy",
      content: `Last Updated: July 2026

This Cookie Policy explains how Maverick Capital uses cookies and similar tracking technologies.

1. WHAT ARE COOKIES
Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.

2. TYPES OF COOKIES WE USE

Essential Cookies:
- Required for basic website functionality
- Enable secure login and authentication
- Cannot be disabled without affecting service

Performance Cookies:
- Collect anonymous usage data
- Help us understand how visitors interact with our site
- Improve website performance and user experience

Functional Cookies:
- Remember your preferences (language, region, etc.)
- Enable personalized features
- Enhance user experience

Analytics Cookies:
- Track website traffic and user behavior
- Help us analyze and optimize our platform
- Data is aggregated and anonymized

3. THIRD-PARTY COOKIES
We use services from Google Analytics, Facebook, and other providers that may set cookies on your device. These are governed by their respective privacy policies.

4. MANAGING COOKIES
You can control cookies through your browser settings:
- Block all cookies
- Delete existing cookies
- Allow cookies only from specific sites
- Clear cookies when you close your browser

Note: Disabling essential cookies may prevent you from using certain features.

5. CONSENT
By continuing to use our website, you consent to our use of cookies as described in this policy.

6. UPDATES
We may update this Cookie Policy to reflect changes in technology or legal requirements.

For questions about our cookie usage, contact us at privacy@maverickcapital.com.`,
    },
  };
  return (
    <footer className="bg-brand-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Maverick Capital"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight text-white">
                  Maverick
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-300">
                  Capital
                </span>
              </div>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-slate-400">
              Professional investment and trading platform offering expert-managed
              portfolios across Gold, Cryptocurrency, Forex, and Indices markets.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-all hover:bg-brand-600 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand-400" />
                <span>Yeni Organize Sanayi Bölgesi, 5. Sk, Kızılay 0392, Cyprus</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <Mail size={16} className="shrink-0 text-brand-400" />
                <a
                  href="mailto:Maverikcapital@gmail.com?subject=Inquiry%20from%20Website&body=Hello%20Maverick%20Capital%20Team%2C%0A%0AI%20would%20like%20to%20know%20more%20about%20your%20investment%20services.%0A%0AThank%20you."
                  className="transition-colors hover:text-white"
                >
                  Maverikcapital@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Maverick Capital. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <button
                key={link.label}
                onClick={() => setActiveModal(link.label)}
                className="text-sm text-slate-500 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      {activeModal && legalModals[activeModal] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Modal content */}
            <h2 className="mb-6 text-2xl font-bold text-brand-950">
              {legalModals[activeModal].title}
            </h2>
            <div className="prose prose-sm max-w-none text-slate-600">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-600">
                {legalModals[activeModal].content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
