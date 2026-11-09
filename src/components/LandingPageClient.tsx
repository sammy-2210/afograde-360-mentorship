"use client";

import { useRegistrationMachine } from "@/hooks/useRegistrationMachine";
import { useUtmCapture } from "@/hooks/useUtmCapture";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StickyMobileBar } from "@/components/layout/StickyMobileBar";
import { RegistrationSection } from "@/components/registration/RegistrationSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { DatesStructureSection } from "@/components/sections/DatesStructureSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { ObjectivesSection } from "@/components/sections/ObjectivesSection";
import { RewardsSection } from "@/components/sections/RewardsSection";
import { TrackRecordSection } from "@/components/sections/TrackRecordSection";
import { FloatingWhatsAppButton } from "@/components/ui/FloatingWhatsAppButton";

export function LandingPageClient() {
  const utm = useUtmCapture();
  const controller = useRegistrationMachine(utm);

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <HeroSection uiState={controller.machine.uiState} />
        <AboutSection />
        <ObjectivesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <DatesStructureSection serverConfig={controller.machine.serverConfig} />
        <TrackRecordSection
          serverTrackRecord={controller.machine.serverConfig?.trackRecord}
        />
        <RewardsSection />
        <RegistrationSection controller={controller} />
        <ContactSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer socialLinks={controller.machine.serverConfig?.socialLinks} />
      <FloatingWhatsAppButton />
      <StickyMobileBar />
    </>
  );
}
