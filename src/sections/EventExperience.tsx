import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import CouplePhoto from "../components/CouplePhoto";
import ScratchCard from "../components/ScratchCard";
import { weddingDetails, type WeddingEvent } from "../config/weddingDetails";
import { weddingTheme } from "../config/weddingTheme";
import "./EventExperience.css";

type CelebrationId = WeddingEvent["id"];
type BurstKind = "sparkle" | "marigold" | "petal" | "splash";

type BurstParticle = {
  id: number;
  left: number;
  top: number;
  angle: number;
  distance: number;
  kind: BurstKind;
  color: string;
};

type CelebrationStyle = {
  eyebrow: string;
  tagline: string;
  accent: string;
  highlight: string;
  mood: string;
  gesture: string;
};

const celebrationStyles: Record<CelebrationId, CelebrationStyle> = {
  cocktail: {
    eyebrow: "AN EVENING IN GOLDEN LIGHT",
    tagline: "A toast to the beginning",
    accent: weddingTheme.colors.deepPlum,
    highlight: weddingTheme.colors.gold,
    mood: "cocktail",
    gesture: "TAP ANYWHERE TO CELEBRATE",
  },
  haldi: {
    eyebrow: "SUNSHINE, FLOWERS & JOY",
    tagline: "Let the golden celebration begin",
    accent: weddingTheme.colors.haldi,
    highlight: weddingTheme.colors.ivory,
    mood: "haldi",
    gesture: "TAP ANYWHERE TO CELEBRATE",
  },
  mehendi: {
    eyebrow: "A GARDEN OF BLESSINGS",
    tagline: "A little art, a lot of love",
    accent: weddingTheme.colors.mehendi,
    highlight: weddingTheme.colors.dustyRose,
    mood: "mehendi",
    gesture: "TAP ANYWHERE FOR FLOWERS",
  },
  wedding: {
    eyebrow: "THE GRAND CELEBRATION",
    tagline: "A promise, a beginning, forever",
    accent: weddingTheme.colors.deepPlum,
    highlight: weddingTheme.colors.gold,
    mood: "wedding",
    gesture: "TAP TO REVEAL THE WEDDING DATE",
  },
};

const eventDetails = weddingDetails.events;

function formatWeddingDate(date: string) {
  const parsedDate = parseEventDate(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}

function parseEventDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00Z`)
    : new Date(date);
}

function getEventDateParts(date?: string) {
  if (!date) return undefined;
  const parsedDate = parseEventDate(date);
  if (Number.isNaN(parsedDate.getTime())) return { date, weekday: "" };

  return {
    date: new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsedDate),
    weekday: new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      timeZone: "UTC",
    }).format(parsedDate),
  };
}

function FlowerMark({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <ellipse
          key={index}
          cx="50"
          cy="21"
          rx="8"
          ry="17"
          transform={`rotate(${index * 36} 50 50)`}
          fill="currentColor"
          fillOpacity=".76"
        />
      ))}
      <circle cx="50" cy="50" r="11" fill="#F6D994" />
      <circle cx="50" cy="50" r="5" fill="#A87939" fillOpacity=".72" />
    </svg>
  );
}

function BotanicalFrame() {
  return (
    <svg className="garden-vine" viewBox="0 0 300 700" fill="none" aria-hidden="true">
      <path
        d="M37 0C135 108 61 199 170 296S61 472 176 568 236 666 268 700"
        stroke="currentColor"
        strokeWidth="2"
      />
      {[
        [88, 104, -38],
        [89, 190, 32],
        [153, 274, -24],
        [128, 365, 28],
        [140, 464, -35],
        [219, 560, 29],
        [205, 640, -24],
      ].map(([x, y, rotation], index) => (
        <g key={index} transform={`translate(${x} ${y}) rotate(${rotation})`}>
          <path
            d="M0 0C-22-25-49-20-48 1-27 21-9 13 0 0Z"
            fill="currentColor"
            fillOpacity=".44"
          />
          <path
            d="M1 1C22-26 48-21 46 0 27 21 9 14 1 1Z"
            fill="currentColor"
            fillOpacity=".68"
          />
          <path d="M0 0V30" stroke="currentColor" strokeOpacity=".65" />
        </g>
      ))}
    </svg>
  );
}

function Burst({
  particles,
  onComplete,
}: {
  particles: BurstParticle[];
  onComplete: (id: number) => void;
}) {
  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className={`event-burst-particle event-burst-particle--${particle.kind}`}
          style={
            {
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              "--burst-color": particle.color,
            } as React.CSSProperties
          }
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
            scale: [0.35, 1, 0.2],
            rotate: particle.angle * 40,
          }}
          transition={{ duration: 1.35, ease: "easeOut" }}
          onAnimationComplete={() => onComplete(particle.id)}
          aria-hidden="true"
        >
          {particle.kind === "sparkle"
            ? "✦"
            : particle.kind === "splash"
              ? ""
              : "✿"}
        </motion.span>
      ))}
    </AnimatePresence>
  );
}

function HennaCanvas({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const previousPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastMotifPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.round(bounds.width * scale);
      canvas.height = Math.round(bounds.height * scale);

      const context = canvas.getContext("2d");
      context?.setTransform(scale, 0, 0, scale, 0, 0);
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    drawingRef.current = false;
    activePointerIdRef.current = null;
    previousPointRef.current = null;
    lastMotifPointRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!enabled || !drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const bounds = canvas.getBoundingClientRect();
    const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    if (
      point.x < 0 ||
      point.y < 0 ||
      point.x > bounds.width ||
      point.y > bounds.height
    ) {
      previousPointRef.current = null;
      return;
    }
    const previousPoint = previousPointRef.current;
    if (!previousPoint) {
      previousPointRef.current = point;
      return;
    }

    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.quadraticCurveTo(
      previousPoint.x,
      previousPoint.y,
      (previousPoint.x + point.x) / 2,
      (previousPoint.y + point.y) / 2,
    );
    context.strokeStyle = "rgba(228, 199, 144, 0.82)";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.shadowColor = "rgba(228, 199, 144, 0.38)";
    context.shadowBlur = 7;
    context.stroke();
    const lastMotifPoint = lastMotifPointRef.current;
    if (
      !lastMotifPoint ||
      Math.hypot(point.x - lastMotifPoint.x, point.y - lastMotifPoint.y) > 24
    ) {
      const angle = Math.atan2(point.y - previousPoint.y, point.x - previousPoint.x);
      context.save();
      context.translate(point.x, point.y);
      context.rotate(angle);
      context.strokeStyle = "rgba(237, 211, 170, 0.8)";
      context.lineWidth = 1;
      context.shadowBlur = 3;
      [-1, 1].forEach((side) => {
        context.beginPath();
        context.ellipse(0, side * 4, 2, 4, 0, 0, Math.PI * 2);
        context.stroke();
      });
      context.restore();
      lastMotifPointRef.current = point;
    }
    previousPointRef.current = point;
  };

  return (
    <canvas
      ref={canvasRef}
      className={`henna-canvas${enabled ? " is-drawing-enabled" : ""}`}
      aria-label="Draw a henna-inspired pattern"
      onPointerDown={(event) => {
        if (!enabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        const bounds = event.currentTarget.getBoundingClientRect();
        previousPointRef.current = {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        };
        lastMotifPointRef.current = null;
        activePointerIdRef.current = event.pointerId;
        const context = event.currentTarget.getContext("2d");
        if (context) {
          context.beginPath();
          context.arc(
            event.clientX - bounds.left,
            event.clientY - bounds.top,
            1.5,
            0,
            Math.PI * 2,
          );
          context.fillStyle = "rgba(228, 199, 144, 0.82)";
          context.fill();
        }
        drawingRef.current = true;
      }}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
      onLostPointerCapture={() => {
        drawingRef.current = false;
        activePointerIdRef.current = null;
        previousPointRef.current = null;
        lastMotifPointRef.current = null;
      }}
    />
  );
}

function CelebrationSection({
  event,
  nextEvent,
  onNavigate,
  isActive,
}: {
  event: WeddingEvent;
  nextEvent?: WeddingEvent;
  onNavigate: (id: string) => void;
  isActive: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const burstIdRef = useRef(0);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [canvasVersion, setCanvasVersion] = useState(0);
  const [detailsRevealed, setDetailsRevealed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const style = celebrationStyles[event.id];
  const isWedding = event.id === "wedding";
  const isHaldi = event.id === "haldi";
  const isMehendi = event.id === "mehendi";
  const weddingDate = weddingDetails.weddingDate
    ? formatWeddingDate(weddingDetails.weddingDate)
    : "";

  const removeBurst = useCallback((id: number) => {
    setBursts((current) => current.filter((particle) => particle.id !== id));
  }, []);

  const releaseBurst = useCallback(
    (clientX: number, clientY: number, kind: BurstKind, count: number) => {
      const section = sectionRef.current;
      if (!section) return;
      const bounds = section.getBoundingClientRect();
      const left = ((clientX - bounds.left) / bounds.width) * 100;
      const top = ((clientY - bounds.top) / bounds.height) * 100;
      const colors: Record<BurstKind, string[]> = {
        sparkle: ["#F5DEA9", "#C7A477", "#FFF4D8"],
        marigold: ["#F5C64C", "#E78628", "#C96931", "#FFF0B7"],
        petal: ["#EBC2C0", "#D89AA5", "#F8E2D2", "#E8C994"],
        splash: ["#E8B94F", "#DC7F2B", "#C96434", "#F8E7B2"],
      };
      const next = Array.from({ length: count }, (_, index) => {
        const id = burstIdRef.current++;
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.3;
        return {
          id,
          left,
          top,
          angle,
          distance: 45 + Math.random() * (kind === "sparkle" ? 100 : 75),
          kind,
          color: colors[kind][index % colors[kind].length],
        };
      });
      setBursts((current) => [...current, ...next]);
    },
    [],
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--pointer-x",
      `${((event.clientX - bounds.left) / bounds.width) * 100}%`,
    );
    event.currentTarget.style.setProperty(
      "--pointer-y",
      `${((event.clientY - bounds.top) / bounds.height) * 100}%`,
    );
  };

  const revealEventDetails = (clientX: number, clientY: number) => {
    setDetailsRevealed(true);
    setHasInteracted(true);
    if (event.id === "cocktail") {
      releaseBurst(clientX, clientY, "sparkle", 28);
    } else if (isHaldi) {
      releaseBurst(clientX, clientY, "petal", 16);
      releaseBurst(clientX, clientY, "marigold", 18);
    } else if (isMehendi) {
      releaseBurst(clientX, clientY, "petal", 20);
    }
  };

  const revealWeddingDate = (clientX?: number, clientY?: number) => {
    const bounds = sectionRef.current?.getBoundingClientRect();
    const x = clientX ?? (bounds ? bounds.left + bounds.width / 2 : 0);
    const y = clientY ?? (bounds ? bounds.top + bounds.height / 2 : 0);
    setDetailsRevealed(true);
    setHasInteracted(true);
    releaseBurst(x, y, "petal", 36);
    releaseBurst(x, y, "sparkle", 42);
  };

  const handleSectionPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("button, canvas, input, a")
    ) {
      return;
    }

    if (isWedding) {
      revealWeddingDate(event.clientX, event.clientY);
    } else {
      revealEventDetails(event.clientX, event.clientY);
    }
  };

  const destination = weddingDetails.venue;
  const eventDate = (isWedding ? weddingDetails.weddingDate : event.date)?.trim();
  const eventDateParts = getEventDateParts(eventDate);
  const eventTime = event.time?.trim();
  const weddingLocation = isWedding
    ? `${destination.name}, ${destination.city}, ${destination.state}, ${destination.country}`
    : event.location?.trim();
  const eventDetailsRows = [
    {
      label: "Date",
      value: eventDateParts?.date ?? "Date to be announced",
      secondary: eventDateParts?.weekday ?? "Day to be announced",
      icon: CalendarDays,
    },
    {
      label: "Time",
      value: eventTime || "Time to be announced",
      icon: Clock3,
    },
    {
      label: "Venue",
      value: weddingLocation || "Venue to be announced",
      icon: MapPin,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id={event.id}
      className={`celebration celebration--${style.mood}${isActive ? " is-active" : ""}`}
      style={
        {
          "--event-accent": style.accent,
          "--event-highlight": style.highlight,
          "--pointer-x": "50%",
          "--pointer-y": "50%",
        } as React.CSSProperties
      }
      aria-labelledby={`${event.id}-title`}
      onPointerMove={handlePointerMove}
      onPointerDown={handleSectionPointerDown}
    >
      <div className="event-ambience" aria-hidden="true">
        <div className="event-ambient-glow" />
        {Array.from({ length: isWedding ? 30 : 20 }).map((_, index) => (
          <span
            key={index}
            className={`ambient-speck ambient-speck--${style.mood}`}
            style={
              {
                "--speck-x": `${(index * 41 + 7) % 100}%`,
                "--speck-y": `${(index * 67 + 13) % 100}%`,
                "--speck-delay": `${-((index * 0.73) % 9)}s`,
                "--speck-duration": `${6 + ((index * 7) % 7)}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {event.id === "haldi" && (
        <>
          <div className="marigold-garland" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <FlowerMark key={index} className="garland-flower" />
            ))}
          </div>
          <div className="haldi-blooms" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <FlowerMark
                key={index}
                className="haldi-floating-flower"
                style={{
                  left: `${index % 2 === 0 ? 4 + index : 83 + (index % 3) * 4}%`,
                  top: `${12 + ((index * 17) % 70)}%`,
                  animationDelay: `${-index * 1.1}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {isMehendi && (
        <>
          <div className="garden-vines" aria-hidden="true">
            <BotanicalFrame />
            <BotanicalFrame />
          </div>
          <div className="garden-blooms" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
              <FlowerMark
                key={index}
                className="garden-bloom"
                style={{
                  left: `${(index * 31 + 9) % 94}%`,
                  top: `${(index * 47 + 12) % 82}%`,
                  animationDelay: `${-index * 1.4}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {isWedding && (
        <div className="wedding-arches" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}

      {isWedding && (
        <div className="wedding-petals" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, index) => (
            <span
              key={index}
              className="wedding-petal"
              style={
                {
                  "--petal-x": `${(index * 37 + 8) % 100}%`,
                  "--petal-delay": `${-((index * 1.1) % 12)}s`,
                  "--petal-duration": `${9 + ((index * 3) % 8)}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="event-grain" aria-hidden="true" />
      <Burst particles={bursts} onComplete={removeBurst} />

      <div className="event-copy">
        <motion.p
          className="event-eyebrow"
          initial={{ opacity: 0, y: 18 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {style.eyebrow}
        </motion.p>

        {isWedding ? (
          <motion.h1
            id="wedding-title"
            className="event-title event-title--wedding"
            aria-label={`${weddingDetails.bride} and ${weddingDetails.groom}`}
            initial={{ opacity: 0, y: 22 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            <span>{weddingDetails.bride}</span>
            <i>&amp;</i>
            <span>{weddingDetails.groom}</span>
          </motion.h1>
        ) : (
          <motion.h1
            id={`${event.id}-title`}
            className="event-title"
            initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
            animate={
              isActive
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 36, filter: "blur(10px)" }
            }
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            {event.name}
          </motion.h1>
        )}

        <motion.div
          className="event-flourish"
          initial={{ width: 0, opacity: 0 }}
          animate={isActive ? { width: 108, opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 1.1, delay: 0.55 }}
          aria-hidden="true"
        >
          ✦
        </motion.div>

        <motion.p
          className="event-tagline"
          initial={{ opacity: 0, y: 12 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {style.tagline}
        </motion.p>

        <CouplePhoto
          src={
            isWedding
              ? weddingDetails.photographs.wedding
              : isHaldi
                ? weddingDetails.photographs.haldi
                : isMehendi
                  ? weddingDetails.photographs.mehendi
                  : weddingDetails.photographs.cocktail
          }
          label={`${weddingDetails.bride} & ${weddingDetails.groom} — ${event.name}`}
          className={`event-couple-photo event-couple-photo--${event.id}`}
        />

        <motion.div
          className={`event-details event-details--${event.id}${detailsRevealed ? " event-details--revealed" : ""}`}
          initial={{ opacity: 0, y: 15 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.9, delay: 0.55 }}
        >
          {isWedding && !detailsRevealed ? (
            <p className="event-detail-pending">
              The date and venue await the grand reveal
            </p>
          ) : (
            eventDetailsRows.map(({ label, value, secondary, icon: Icon }) => (
              <article className="event-detail" key={label}>
                <Icon className="event-detail-icon" aria-hidden="true" />
                <div className="event-detail-copy">
                  <span>{label}</span>
                  <strong>{value}</strong>
                  {secondary && <small>{secondary}</small>}
                </div>
              </article>
            ))
          )}
        </motion.div>

        {isMehendi && (
          <>
            <div className="henna-drawing-area">
              <p className="henna-instructions">Touch to create your Mehendi design</p>
              <HennaCanvas key={canvasVersion} enabled={drawingEnabled} />
              <div className="henna-controls">
                <button
                  type="button"
                  className="event-action henna-control"
                  aria-pressed={drawingEnabled}
                  onClick={() => setDrawingEnabled((enabled) => !enabled)}
                >
                  {drawingEnabled ? "Finish Drawing" : "Start Drawing"}
                </button>
                <button
                  type="button"
                  className="event-action event-action--clear henna-control"
                  onClick={() => setCanvasVersion((version) => version + 1)}
                >
                  Clear Drawing
                </button>
              </div>
            </div>
            <p className="henna-scroll-hint">
              <span aria-hidden="true">↓</span> Scroll down to continue
            </p>
          </>
        )}

        <motion.p
          className="event-gesture"
          initial={{ opacity: 0 }}
          animate={isActive && !hasInteracted ? { opacity: 0.9 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.25 }}
        >
          <span className="event-gesture-pointer" aria-hidden="true">
            ☝
          </span>
          {style.gesture}
        </motion.p>
        {isWedding && (
          <>
            {!detailsRevealed && (
              <ScratchCard
                secret={weddingDate}
                onReveal={() => revealWeddingDate()}
              />
            )}
            <motion.button
              type="button"
              className="event-action event-action--finale"
              initial={{ opacity: 0, y: 12 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              onClick={(eventClick) =>
                revealWeddingDate(eventClick.clientX, eventClick.clientY)
              }
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <span aria-hidden="true">✦</span>
              {detailsRevealed ? "Celebrate their forever" : "Tap to reveal the wedding date"}
            </motion.button>
          </>
        )}
      </div>

      {nextEvent && (
        <motion.button
          type="button"
          className="event-scroll-cue"
          onClick={() => onNavigate(nextEvent.id)}
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <span>CONTINUE TO {nextEvent.name.toUpperCase()}</span>
          <i aria-hidden="true">↓</i>
        </motion.button>
      )}
    </section>
  );
}

export default function EventExperience() {
  const [activeEvent, setActiveEvent] = useState<CelebrationId | null>(null);
  const experienceRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 24,
    restDelta: 0.001,
  });

  useEffect(() => {
    const experience = experienceRef.current;
    if (!experience) return;
    const sections = Array.from(
      experience.querySelectorAll<HTMLElement>(".celebration"),
    );
    const updateActiveEvent = () => {
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      const mostVisible = sections
        .map((section) => {
          const bounds = section.getBoundingClientRect();
          const visibleHeight =
            Math.min(bounds.bottom, viewportHeight) - Math.max(bounds.top, 0);
          return {
            id: section.id as CelebrationId,
            ratio: Math.max(0, visibleHeight) / Math.min(bounds.height, viewportHeight),
          };
        })
        .sort((a, b) => b.ratio - a.ratio)[0];
      const current =
        mostVisible && mostVisible.ratio >= 0.2 ? mostVisible.id : null;
      setActiveEvent((previous) => (previous === current ? previous : current));
    };

    updateActiveEvent();
    window.addEventListener("scroll", updateActiveEvent, { passive: true });
    window.addEventListener("resize", updateActiveEvent);
    window.visualViewport?.addEventListener("resize", updateActiveEvent);
    return () => {
      window.removeEventListener("scroll", updateActiveEvent);
      window.removeEventListener("resize", updateActiveEvent);
      window.visualViewport?.removeEventListener("resize", updateActiveEvent);
    };
  }, []);

  const navigateToEvent = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <div className="event-experience" ref={experienceRef}>
      <AnimatePresence>
        {activeEvent && (
          <motion.div
            className="event-progress"
            style={{ scaleX: progress }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeEvent && (
          <motion.nav
            className="event-navigation"
            aria-label="Wedding celebrations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="event-navigation-label">THE CELEBRATIONS</span>
            {eventDetails.map((event) => (
              <button
                key={event.id}
                type="button"
                className={`event-navigation-link${activeEvent === event.id ? " is-active" : ""}`}
                aria-label={`Go to ${event.name}`}
                aria-current={activeEvent === event.id ? "location" : undefined}
                onClick={() => navigateToEvent(event.id)}
              >
                <span className="event-navigation-dot" />
                <span className="event-navigation-name">{event.name}</span>
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      {eventDetails.map((event, index) => (
        <CelebrationSection
          key={event.id}
          event={event}
          nextEvent={eventDetails[index + 1]}
          onNavigate={navigateToEvent}
          isActive={activeEvent === event.id}
        />
      ))}
    </div>
  );
}
