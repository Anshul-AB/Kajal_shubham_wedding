
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CouplePhoto from "../components/CouplePhoto";
import { weddingDetails } from "../config/weddingDetails";
import "./PalaceOpening.css";

function playBell() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();

    const startAt = context.currentTime + 0.05;

    [880, 1174.66].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0.0001, startAt + index * 0.15);
      gain.gain.exponentialRampToValueAtTime(
        0.12,
        startAt + index * 0.15 + 0.05
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + index * 0.15 + 2.5
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startAt + index * 0.15);
      oscillator.stop(startAt + index * 0.15 + 2.6);
    });

    const resumed =
      context.state === "suspended" ? context.resume() : Promise.resolve();
    void resumed
      .then(() => {
        window.setTimeout(() => {
          void context.close();
        }, 3000);
      })
      .catch((error: unknown) => {
        console.warn("Bell sound could not start:", error);
        void context.close().catch((closeError: unknown) => {
          console.warn("Bell audio context could not close:", closeError);
        });
      });
  } catch (error) {
    console.warn("Bell sound unavailable:", error);
  }
}

type PalaceOpeningProps = {
  onStartMusic?: () => void;
};

const coupleNameVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
      delayChildren: 0.2,
      staggerChildren: 0.07,
    },
  },
};

const nameCharacterVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.06 } },
};

export default function PalaceOpening({ onStartMusic }: PalaceOpeningProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const namesRevealedRef = useRef(false);
  const musicStartRequestedRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [namesAnimationFinished, setNamesAnimationFinished] = useState(false);
  const coupleNames = `${weddingDetails.bride} & ${weddingDetails.groom}`;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) setHasScrolled(true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (
      videoFinished &&
      namesAnimationFinished &&
      !musicStartRequestedRef.current
    ) {
      musicStartRequestedRef.current = true;
      onStartMusic?.();
    }
  }, [namesAnimationFinished, onStartMusic, videoFinished]);

  const revealNamesNearEnd = () => {
    const video = videoRef.current;
    if (
      !video ||
      namesRevealedRef.current ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0 ||
      video.duration - video.currentTime > 1.7
    ) {
      return;
    }

    namesRevealedRef.current = true;
    setShowNames(true);
  };

  const handleEnter = async () => {
    const video = videoRef.current;

    if (!video) {
      console.error("Palace video element not found");
      return;
    }

    try {
      playBell();
      setStarted(true);
      setShowNames(false);
      setVideoFinished(false);
      setNamesAnimationFinished(false);
      musicStartRequestedRef.current = false;
      namesRevealedRef.current = false;

      video.currentTime = 0;
      video.muted = false;
      video.playbackRate = 0.75;

      await video.play();
    } catch (error) {
      console.error("Palace video playback failed:", {
        source:
          video.currentSrc ||
          video.querySelector("source")?.src ||
          "/videos/palace-opening.mp4",
        error,
        mediaError: video.error,
      });
      setStarted(false);
    }
  };


  return (
    <main className="palace-hero">

      <video
        ref={videoRef}
        className="palace-video"
        muted={false}
        playsInline
        preload="auto"
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.playbackRate = 0.75;
          }
        }}
        onDurationChange={revealNamesNearEnd}
        onTimeUpdate={revealNamesNearEnd}
        onEnded={() => {
          setVideoFinished(true);
          if (!namesRevealedRef.current) {
            namesRevealedRef.current = true;
            setShowNames(true);
          }
        }}
        onError={(event) => {
          const video = event.currentTarget;
          console.error("Palace video failed to load or decode:", {
            source:
              video.currentSrc ||
              video.querySelector("source")?.src ||
              "/videos/palace-opening.mp4",
            code: video.error?.code,
            message: video.error?.message,
          });
          setStarted(false);
          setShowNames(false);
          setVideoFinished(false);
          setNamesAnimationFinished(false);
          namesRevealedRef.current = false;
        }}
      >
        <source
          src="/videos/palace-opening.mp4"
          type="video/mp4"
        />
      </video>


      <div className="video-shade" />

      <div className="gold-particles" aria-hidden="true">
        {Array.from({ length: 32 }).map((_, index) => (
          <span
            key={index}
            className="gold-particle"
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 53) % 100}%`,
              animationDelay: `${(index % 8) * -0.7}s`,
              animationDuration: `${5 + (index % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="floating-petals" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="floating-petal"
            style={{
              left: `${(index * 29) % 100}%`,
              animationDelay: `${index * -0.9}s`,
              animationDuration: `${8 + (index % 5)}s`,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {!started && (
          <motion.div
            className="palace-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="intro-eyebrow">
              A ROYAL CELEBRATION AWAITS
            </p>

            <div className="intro-ornament">✦</div>

            <button
              className="enter-button"
              onClick={handleEnter}
            >
              ENTER THE CELEBRATION
              <span>→</span>
            </button>

            <p className="intro-hint">
              TAP TO BEGIN THE JOURNEY
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNames && (
          <motion.div
            className="couple-reveal"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <CouplePhoto
              src={weddingDetails.photographs.romantic}
              label="Wedding couple portrait"
              className="palace-couple-photo"
              showCaption={false}
            />
            <motion.h1
              className="couple-names"
              aria-label={coupleNames}
              initial="hidden"
              animate="visible"
              variants={coupleNameVariants}
              onAnimationComplete={() => setNamesAnimationFinished(true)}
            >
              {Array.from(coupleNames).map((character, index) => (
                <motion.span
                  key={`${character}-${index}`}
                  aria-hidden="true"
                  variants={nameCharacterVariants}
                  className="couple-name-character"
                >
                  {character}
                </motion.span>
              ))}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNames && !hasScrolled && (
          <motion.div
            className="palace-scroll-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            aria-hidden="true"
          >
            <span className="palace-scroll-arrow">↓</span>
            <span className="palace-scroll-hint-text">SCROLL TO EXPLORE</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
