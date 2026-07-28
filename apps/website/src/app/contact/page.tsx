"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Mail,
  Clock,
  ChevronRight,
  Send,
  CheckCircle2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const subjectOptions = [
  { value: "", label: "Select a subject" },
  { value: "general", label: "General Inquiry" },
  { value: "investment", label: "Investment Question" },
  { value: "technical", label: "Technical Support" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

const contactInfo = [
  {
    icon: MapPin,
    title: "Office Address",
    detail: "Yeni Organize Sanayi Bölgesi, 5. Sk, Kızılay 0392, Cyprus",
  },
  {
    icon: Mail,
    title: "Email",
    detail: "Maverikcapital@gmail.com",
    href: "mailto:Maverikcapital@gmail.com?subject=Inquiry%20from%20Website&body=Hello%20Maverick%20Capital%20Team%2C%0A%0AI%20would%20like%20to%20know%20more%20about%20your%20investment%20services.%0A%0AThank%20you.",
  },
  {
    icon: Clock,
    title: "Working Hours",
    detail: "Mon-Fri: 8AM - 6PM EET, Sat: 9AM - 2PM EET",
  },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Form submitted:", data);
    setIsSubmitted(true);
    reset();
  };

  const handleReset = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="pt-24">
      {/* Hero Banner */}
      <section className="relative gradient-hero py-20">
        <motion.div
          className="absolute top-10 right-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-brand-200/70">
            <a href="/" className="transition-colors hover:text-white">
              Home
            </a>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">Contact</span>
          </nav>

          <motion.h1
            className="text-4xl font-bold text-white md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Get in Touch
          </motion.h1>
          <motion.p
            className="mt-4 max-w-xl text-lg text-brand-100/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Have a question or ready to start investing? We&apos;re here to help.
            Reach out and our team will respond promptly.
          </motion.p>
        </div>
      </section>

      {/* Two-Column Layout */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Left Column - Contact Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-glass sm:p-8">
              <h2 className="mb-2 text-xl font-bold text-brand-900">
                Send us a Message
              </h2>
              <p className="mb-8 text-sm text-slate-500">
                Fill out the form below and we&apos;ll get back to you within 24
                hours.
              </p>

              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center py-12 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-500/10">
                      <CheckCircle2 className="h-8 w-8 text-success-500" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-brand-900">
                      Message Sent!
                    </h3>
                    <p className="mb-6 max-w-sm text-sm text-slate-500">
                      Thank you for reaching out. Our team will review your
                      message and respond within 24 hours.
                    </p>
                    <button
                      onClick={handleReset}
                      className="rounded-lg gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Full Name <span className="text-danger-500">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        {...register("name")}
                        className={cn(
                          "w-full rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20",
                          errors.name
                            ? "border-danger-500 bg-danger-500/5"
                            : "border-slate-200"
                        )}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-danger-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Email Address <span className="text-danger-500">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        {...register("email")}
                        className={cn(
                          "w-full rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20",
                          errors.email
                            ? "border-danger-500 bg-danger-500/5"
                            : "border-slate-200"
                        )}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-danger-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone (Optional) */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Phone Number{" "}
                        <span className="text-slate-400">(optional)</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+90 392 000 0000"
                        {...register("phone")}
                        className={cn(
                          "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                        )}
                      />
                    </div>

                    {/* Subject Dropdown */}
                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Subject <span className="text-danger-500">*</span>
                      </label>
                      <select
                        id="subject"
                        {...register("subject")}
                        className={cn(
                          "w-full appearance-none rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20",
                          errors.subject
                            ? "border-danger-500 bg-danger-500/5"
                            : "border-slate-200"
                        )}
                      >
                        {subjectOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-xs text-danger-500">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Message <span className="text-danger-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us how we can help you..."
                        {...register("message")}
                        className={cn(
                          "w-full resize-none rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20",
                          errors.message
                            ? "border-danger-500 bg-danger-500/5"
                            : "border-slate-200"
                        )}
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-danger-500">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-lg gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30",
                        isSubmitting && "cursor-not-allowed opacity-70"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column - Contact Info Cards */}
          <motion.div
            className="space-y-5 lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-glass"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      {item.title}
                    </h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 text-sm text-slate-500 transition-colors hover:text-brand-600"
                      >
                        {item.detail}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Social Links */}
            <motion.div
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <h3 className="mb-3 text-sm font-semibold text-brand-900">
                Follow Us
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                  >
                    <social.icon className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Google Maps Embed */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-2 text-center text-2xl font-bold text-brand-900">
              Find Us on the Map
            </h2>
            <p className="mb-8 text-center text-sm text-slate-500">
              Visit our office in Kızılay, Cyprus
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-glass">
              <iframe
                src="https://www.google.com/maps?q=Yeni+Organize+Sanayi+B%C3%B6lgesi+5.+Sk+K%C4%B1z%C4%B1lay+Cyprus&z=15&output=embed"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Maverick Capital Office Location — Yeni Organize Sanayi Bölgesi, 5. Sk, Kızılay, Cyprus"
                className="w-full"
              />
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Yeni+Organize+Sanayi+B%C3%B6lgesi+5.+Sk+K%C4%B1z%C4%B1lay+Cyprus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                <MapPin size={16} />
                Open in Google Maps
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
