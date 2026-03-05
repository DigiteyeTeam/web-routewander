import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SectionDestinationsScroll from "@/components/SectionDestinationsScroll";
import SectionExperiences from "@/components/SectionExperiences";
import BodyFooterLinks from "@/components/BodyFooterLinks";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SectionDestinationsScroll />
        <SectionExperiences />
        <BodyFooterLinks />
      </main>
      <Footer />
    </>
  );
}