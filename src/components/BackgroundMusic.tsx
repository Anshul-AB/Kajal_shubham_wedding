import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "./BackgroundMusic.css";

const MUSIC_PATH = "/audio/wedding-background.mp3";
const MUTE_PREFERENCE_KEY = "wedding-music-muted";

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
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(getInitialMutedPreference);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  const start = useCallback(() => {
    setIsVisible(true);
    const audio = audioRef.current;
    if (!audio || audioUnavailable) return;

    audio.muted = isMuted;
    void audio.play().catch((error: unknown) => {
      console.error("Background music playback failed:", {
        source: audio.currentSrc || MUSIC_PATH,
        error,
      });
    });
  }, [audioUnavailable, isMuted]);

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

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_PATH}
        loop
        preload="none"
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onCanPlay={() => setAudioUnavailable(false)}
        onError={(event) => {
          const audio = event.currentTarget;
          console.error("Background music file could not be loaded:", {
            source: audio.currentSrc || MUSIC_PATH,
            code: audio.error?.code,
            message: audio.error?.message,
            expectedPath: `public${MUSIC_PATH}`,
          });
          setAudioUnavailable(true);
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
            {audioUnavailable
              ? "Add your music file"
              : isPlaying
                ? "Music on"
                : "Music off"}
          </span>
          <button
            type="button"
            className="background-music-button"
            onClick={togglePlayback}
            disabled={audioUnavailable}
            aria-label={isPlaying ? "Pause background music" : "Play background music"}
            title={
              audioUnavailable
                ? `Place your audio file at public${MUSIC_PATH}`
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
              <svg viewBox="0 0 24 24" aria-hidden="true">
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
