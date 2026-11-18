
import { useRef } from "react";
import { MotionConfig } from "framer-motion";
import BackgroundMusic, {
  type BackgroundMusicHandle,
} from "./components/BackgroundMusic";
import CoupleIntroduction from "./sections/CoupleIntroduction";
import PalaceOpening from "./sections/PalaceOpening";
import EventExperience from "./sections/EventExperience";
import RSVPSection from "./sections/RSVPSection";
import AdminDashboard from "./sections/AdminDashboard";

function App() {
  const musicRef = useRef<BackgroundMusicHandle>(null);

  if (window.location.pathname.replace(/\/+$/, "") === "/admin") {
    return (
      <MotionConfig reducedMotion="user">
        <AdminDashboard />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <PalaceOpening onStartMusic={() => musicRef.current?.start()} />
      <CoupleIntroduction />
      <EventExperience />
      <RSVPSection />
      <BackgroundMusic ref={musicRef} />
    </MotionConfig>
  );
}

export default App;
