import Hero from "@/components/Hero";
import Principles from "@/components/Principles";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import BenchmarkPreview from "@/components/BenchmarkPreview";
import AuditSample from "@/components/AuditSample";
import Faq from "@/components/Faq";
import BetaBanner from "@/components/BetaBanner";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <Hero />
      <Principles />
      <Services />
      <HowItWorks />
      <BenchmarkPreview />
      <AuditSample />
      <Faq />
      <BetaBanner />
    </div>
  );
}

