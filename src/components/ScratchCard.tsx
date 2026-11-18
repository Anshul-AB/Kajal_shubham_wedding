import { useEffect, useRef, useState } from "react";
import "./ScratchCard.css";

type ScratchCardProps = {
  secret: string;
  onReveal: () => void;
};

export default function ScratchCard({ secret, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchedPointsRef = useRef(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !context) return;

    const paintCover = () => {
      const bounds = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(bounds.width * scale));
      canvas.height = Math.max(1, Math.round(bounds.height * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);

      const gradient = context.createLinearGradient(0, 0, bounds.width, bounds.height);
      gradient.addColorStop(0, "#e9d8b5");
      gradient.addColorStop(0.5, "#bb985f");
      gradient.addColorStop(1, "#e4c995");
      context.globalCompositeOperation = "source-over";
      context.fillStyle = gradient;
      context.fillRect(0, 0, bounds.width, bounds.height);

      context.strokeStyle = "rgba(255, 247, 224, 0.4)";
      context.lineWidth = 1;
      for (let x = -bounds.height; x < bounds.width; x += 16) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x + bounds.height, bounds.height);
        context.stroke();
      }

      context.globalCompositeOperation = "source-over";
      context.fillStyle = "#503845";
      context.font = "600 10px Cinzel, serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("RUB TO REVEAL", bounds.width / 2, bounds.height / 2);
      context.globalCompositeOperation = "destination-out";
    };

    paintCover();
    const observer = new ResizeObserver(paintCover);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    onReveal();
  };

  const scratch = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed || event.buttons === 0) return;
    const canvas = event.currentTarget;
    const context = canvas.getContext("2d");
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(event.clientX - bounds.left, event.clientY - bounds.top, 17, 0, Math.PI * 2);
    context.fill();
    scratchedPointsRef.current += 1;

    if (scratchedPointsRef.current % 8 === 0) {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0;
      let samples = 0;
      for (let index = 3; index < pixels.length; index += 64) {
        if (pixels[index] < 32) transparent += 1;
        samples += 1;
      }
      if (transparent / samples > 0.42) reveal();
    }
  };

  return (
    <div className={`scratch-card${revealed ? " is-revealed" : ""}`}>
      <div className="scratch-card-secret" aria-live="polite">
        <span>{revealed ? secret : "A little surprise awaits"}</span>
      </div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          className="scratch-card-surface"
          aria-label="Scratch this card to reveal a surprise"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            scratch(event);
          }}
          onPointerMove={scratch}
          onPointerUp={() => {
            scratchedPointsRef.current = 0;
          }}
          onPointerCancel={() => {
            scratchedPointsRef.current = 0;
          }}
        />
      )}
      {!revealed && (
        <button type="button" className="scratch-card-accessible" onClick={reveal}>
          Tap to reveal
        </button>
      )}
    </div>
  );
}
