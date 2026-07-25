import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { IntroSection } from "@/components/sections/IntroSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { MarketsSection } from "@/components/sections/MarketsSection";
import { PlansSection } from "@/components/sections/PlansSection";
import { HardCapSection } from "@/components/sections/HardCapSection";
import { TickerSection } from "@/components/sections/TickerSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { TransactionNotification } from "@/components/sections/TransactionNotification";
import { BlogSection } from "@/components/sections/BlogSection";
import { OrganizationSchema, FAQSchema, ServiceSchema } from "@/components/StructuredData";

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <FAQSchema />
      <ServiceSchema />
      <HeroSection />
      <StatsSection />
      <IntroSection />
      <WhyChooseUs />
      <ServicesSection />
      <MarketsSection />
      <PlansSection />
      <HardCapSection />
      <TickerSection />
      <TestimonialsSection />
      <BlogSection />
      <FAQSection />
      <CTASection />
      <TransactionNotification />
    </>
  );
}
