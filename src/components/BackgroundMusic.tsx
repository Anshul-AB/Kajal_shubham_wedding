import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import MUSIC_PATH from "../assets/audio/wedding-audio.mp3";
import "./BackgroundMusic.css";

const EXPECTED_MUSIC_PATH = "src/assets/audio/wedding-audio.mp3";
const MUTE_PREFERENCE_KEY = "wedding-music-muted";
const BACKGROUND_MUSIC_VOLUME = 0.2;
const FADE_IN_DURATION_MS = 3000;
const MUSIC_START_OFFSET_SECONDS = 38;

export type BackgroundMusicHandle = {
  start: () => void;
};

function getInitialMutedPreference() {
  try {
    return window.localStorage.getItem(MUTE_PREFERENCE_KEY) === "true";
  } catch (error) {
    console.warn("Could not read the saved music preference:", error);
    return false;
  }
}

const BackgroundMusic = forwardRef<BackgroundMusicHandle>(function BackgroundMusic(
  _props,
  ref,
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const startPendingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(getInitialMutedPreference);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  useEffect(
    () => () => {
      if (fadeTimerRef.current !== null) {
        window.clearInterval(fadeTimerRef.current);
      }
    },
    [],
  );

  const fadeIn = useCallback((audio: HTMLAudioElement) => {
    if (fadeTimerRef.current !== null) {
      window.clearInterval(fadeTimerRef.current);
    }

    const startedAt = performance.now();
    fadeTimerRef.current = window.setInterval(() => {
      const progress = Math.min(
        (performance.now() - startedAt) / FADE_IN_DURATION_MS,
        1,
      );
      audio.volume = BACKGROUND_MUSIC_VOLUME * progress;

      if (progress === 1 && fadeTimerRef.current !== null) {
        window.clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    }, 50);
  }, []);

  const seekToStart = useCallback((audio: HTMLAudioElement) => {
    if (
      Number.isFinite(audio.duration) &&
      audio.duration > MUSIC_START_OFFSET_SECONDS
    ) {
      audio.currentTime = MUSIC_START_OFFSET_SECONDS;
    }
  }, []);

  const start = useCallback(() => {
    setIsVisible(true);
    const audio = audioRef.current;
    if (!audio || audioUnavailable || startPendingRef.current || !audio.paused) {
      return;
    }

    const shouldFadeIn = !hasStartedRef.current;
    if (shouldFadeIn) audio.volume = 0;
    seekToStart(audio);
    audio.muted = isMuted;
    startPendingRef.current = true;
    void audio
      .play()
      .then(() => {
        startPendingRef.current = false;
        setPlaybackBlocked(false);
        if (shouldFadeIn) {
          hasStartedRef.current = true;
          fadeIn(audio);
        }
      })
      .catch((error: unknown) => {
        startPendingRef.current = false;
        setPlaybackBlocked(true);
        console.warn("Background music playback needs user interaction:", {
          source: audio.currentSrc || MUSIC_PATH,
          error,
        });
      });
  }, [audioUnavailable, fadeIn, isMuted, seekToStart]);

  useImperativeHandle(ref, () => ({ start }), [start]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || audioUnavailable) return;

    if (audio.paused) {
      start();
    } else {
      audio.pause();
    }
  };

  const toggleMuted = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) audioRef.current.muted = nextMuted;

    try {
      window.localStorage.setItem(MUTE_PREFERENCE_KEY, String(nextMuted));
    } catch (error) {
      console.warn("Could not save the music mute preference:", error);
    }
  };

  const statusText = audioUnavailable
    ? "Music unavailable"
    : playbackBlocked
      ? "Tap to play"
      : isPlaying
        ? "Music on"
        : "Music off";

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_PATH}
        loop
        preload="none"
        muted={isMuted}
        onLoadedMetadata={(event) => seekToStart(event.currentTarget)}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          if (!audio.paused && audio.currentTime < 0.1) {
            seekToStart(audio);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlay={() => {
          setAudioUnavailable(false);
          setPlaybackBlocked(false);
        }}
        onError={(event) => {
          const audio = event.currentTarget;
          console.error("Background music file could not be loaded:", {
            source: audio.currentSrc || MUSIC_PATH,
            code: audio.error?.code,
            message: audio.error?.message,
            expectedPath: EXPECTED_MUSIC_PATH,
          });
          if (fadeTimerRef.current !== null) {
            window.clearInterval(fadeTimerRef.current);
            fadeTimerRef.current = null;
          }
          startPendingRef.current = false;
          setAudioUnavailable(true);
          setPlaybackBlocked(false);
          setIsPlaying(false);
        }}
      />

      {isVisible && (
        <aside
          className={`background-music${isPlaying ? " is-playing" : ""}`}
          aria-label="Background music controls"
        >
          <span className="background-music-indicator" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="background-music-status" aria-live="polite">
            {statusText}
          </span>
          <button
            type="button"
            className="background-music-button"
            onClick={togglePlayback}
            disabled={audioUnavailable}
            aria-label={isPlaying ? "Pause background music" : "Play background music"}
            title={
              audioUnavailable
                ? `Place your audio file at ${EXPECTED_MUSIC_PATH}`
                : isPlaying
                  ? "Pause music"
                  : "Play music"
            }
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14M16 5v14" />
              </svg>
            ) : (
              <svg
                className="background-music-play-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m8 5 11 7-11 7z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="background-music-button"
            onClick={toggleMuted}
            aria-label={isMuted ? "Unmute background music" : "Mute background music"}
            title={isMuted ? "Unmute music" : "Mute music"}
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4zM17 9l5 6m0-6-5 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13" />
              </svg>
            )}
          </button>
        </aside>
      )}
    </>
  );
});

export default BackgroundMusic;
