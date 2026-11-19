import { motion } from "framer-motion";
import CouplePhoto from "../components/CouplePhoto";
import { weddingDetails } from "../config/weddingDetails";
import "./CoupleIntroduction.css";

function FamilyDedication({
  role,
  firstName,
  secondName,
  photo,
  photoLabel,
}: {
  role: "Bride" | "Groom";
  firstName: string;
  secondName: string;
  photo: string;
  photoLabel: string;
}) {
  const parentNames = [firstName, secondName].filter(Boolean);

  return (
    <article className="family-dedication">
      <CouplePhoto
        src={photo}
        label={photoLabel}
        className="family-dedication-photo"
        showCaption={false}
      />
      <p className="family-dedication-role">{role}</p>
      <p className="family-dedication-name">
        {role === "Bride" ? weddingDetails.bride : weddingDetails.groom}
      </p>
      <p className="family-dedication-copy">
        {parentNames.length > 0
          ? `${role === "Bride" ? "Daughter" : "Son"} of ${parentNames.join(" and ")}`
          : `With the loving blessings of ${role === "Bride" ? "her" : "his"} family`}
      </p>
    </article>
  );
}

export default function CoupleIntroduction() {
  return (
    <section className="couple-introduction" aria-labelledby="introduction-title">
      <div className="introduction-ornament" aria-hidden="true">
        ✦
      </div>
      <motion.p
        className="introduction-eyebrow"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        TWO HEARTS, ONE BEAUTIFUL BEGINNING
      </motion.p>
      <h2 id="introduction-title" className="introduction-names">
        <span>{weddingDetails.bride}</span>
        <i>&amp;</i>
        <span>{weddingDetails.groom}</span>
      </h2>
      <p className="introduction-message">
        With hearts full of joy, we invite you to share in the beginning of our
        forever.
      </p>

      <div className="introduction-portraits">
        <CouplePhoto
          src={weddingDetails.photographs.main}
          label="Kajal and Shubham"
          className="introduction-photo introduction-photo--main"
          imagePosition="center center"
          showCaption={false}
        />
        <CouplePhoto
          src={weddingDetails.photographs.fullLength}
          label="Kajal and Shubham"
          className="introduction-photo introduction-photo--full"
          imagePosition="center center"
          showCaption={false}
        />
      </div>

      <div className="family-introductions">
        <FamilyDedication
          role="Bride"
          firstName={weddingDetails.families.bride.fatherName}
          secondName={weddingDetails.families.bride.motherName}
          photo={weddingDetails.photographs.familyOne}
          photoLabel="Bride's family portrait"
        />
        <span className="family-divider" aria-hidden="true">
          ❧
        </span>
        <FamilyDedication
          role="Groom"
          firstName={weddingDetails.families.groom.fatherName}
          secondName={weddingDetails.families.groom.motherName}
          photo={weddingDetails.photographs.familyTwo}
          photoLabel="Groom's family portrait"
        />
      </div>
    </section>
  );
}
