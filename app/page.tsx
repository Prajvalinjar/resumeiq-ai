import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import Hero from "@/components/Hero";
import Transformation from "@/components/Transformation";
import HowItWorks from "@/components/HowItWorks";
import Comparison from "@/components/Comparison";
import AICoach from "@/components/AICoach";
import GuestVsFree from "@/components/GuestVsFree";
import FinalCTA from "@/components/FinalCTA";

import SectionDivider from "@/components/SectionDivider";

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* Hero */}
        <Hero />

        {/* Transformation */}
        <Transformation />

        {/* Divider */}
        <SectionDivider />

        {/* How It Works */}
        <HowItWorks />

        {/* Divider */}
        <SectionDivider />

        {/* Comparison */}
        <Comparison />

        {/* Divider */}
        <SectionDivider />

        {/* AI Coach */}
        <AICoach />

        {/* Divider */}
        <SectionDivider />

        {/* Guest vs Free */}
        <GuestVsFree />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}