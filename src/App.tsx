
import { useRef } from "react";
import { MotionConfig } from "framer-motion";
import BackgroundMusic, {
  type BackgroundMusicHandle,
} from "./components/BackgroundMusic";
import CoupleIntroduction from "./sections/CoupleIntroduction";
import PalaceOpening from "./sections/PalaceOpening";
import EventExperience from "./sections/EventExperience";

function App() {
  const musicRef = useRef<BackgroundMusicHandle>(null);

  return (
    <MotionConfig reducedMotion="user">
      <PalaceOpening onStartMusic={() => musicRef.current?.start()} />
      <CoupleIntroduction />
      <EventExperience />
      <BackgroundMusic ref={musicRef} />
    </MotionConfig>
  );
}

export default App;
