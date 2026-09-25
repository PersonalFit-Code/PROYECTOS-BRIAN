import Navbar from "@/components/ui/Navbar";
import { ReservationProvider } from "@/components/ui/ReservationProvider";
import { ChatProvider } from "@/components/chat/ChatProvider";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Hero from "@/components/sections/Hero";
import StarDishes from "@/components/sections/StarDishes";
import Experience from "@/components/sections/Experience";
import SocialProof from "@/components/sections/SocialProof";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <ChatProvider page="home">
      <ReservationProvider>
        <Navbar />
        <main id="main" className="relative">
          <Hero />
          <StarDishes />
          <Experience />
          <SocialProof />
        </main>
        <Footer />
        <MobileStickyBar />
      </ReservationProvider>
    </ChatProvider>
  );
}
