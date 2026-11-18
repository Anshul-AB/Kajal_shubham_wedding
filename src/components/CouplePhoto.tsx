import "./CouplePhoto.css";

type CouplePhotoProps = {
  src: string;
  label: string;
  className?: string;
  imagePosition?: string;
  showCaption?: boolean;
};

export default function CouplePhoto({
  src,
  label,
  className = "",
  imagePosition = "center center",
  showCaption = true,
}: CouplePhotoProps) {
  return (
    <figure className={`couple-photo ${className}`}>
      <img
        src={src}
        alt={label}
        loading="lazy"
        style={{ objectPosition: imagePosition }}
      />
      <span className="couple-photo-overlay" aria-hidden="true" />
      {showCaption && <figcaption>{label}</figcaption>}
    </figure>
  );
}
