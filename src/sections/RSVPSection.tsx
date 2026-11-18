import { useRef, useState, type FormEvent } from "react";
import { weddingDetails, type WeddingEventId } from "../config/weddingDetails";
import { supabase, supabaseConfigError } from "../supabaseClient";
import "./RSVPSection.css";

type Attendance = "joyfully_accept" | "regretfully_decline";

const celebrations = weddingDetails.events.map(({ id, name }) => ({ id, name }));

export default function RSVPSection() {
  const submissionInProgress = useRef(false);
  const [guestName, setGuestName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [attendance, setAttendance] = useState<Attendance | "">("");
  const [guestCount, setGuestCount] = useState("");
  const [selectedCelebrations, setSelectedCelebrations] = useState<WeddingEventId[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleCelebration = (id: WeddingEventId) => {
    setSelectedCelebrations((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionInProgress.current) return;

    setErrorMessage("");
    setConfirmation("");

    if (!guestName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    const normalizedMobile = mobileNumber.replace(/[\s()-]/g, "");
    const digits = normalizedMobile.replace(/\D/g, "");
    if (!/^\+?\d{7,15}$/.test(normalizedMobile) || digits.length < 7 || digits.length > 15) {
      setErrorMessage("Please enter a valid mobile number with 7 to 15 digits.");
      return;
    }

    const parsedGuestCount = Number(guestCount);
    if (
      attendance === "joyfully_accept" &&
      (!Number.isInteger(parsedGuestCount) ||
        parsedGuestCount < 1 ||
        parsedGuestCount > 2147483647)
    ) {
      setErrorMessage("Please enter a valid whole number of guests attending.");
      return;
    }

    if (attendance === "joyfully_accept" && selectedCelebrations.length === 0) {
      setErrorMessage("Please select at least one celebration you can attend.");
      return;
    }

    if (!attendance) {
      setErrorMessage("Please confirm whether you can join the celebration.");
      return;
    }

    if (!supabase) {
      setErrorMessage(
        `Your RSVP was not sent: ${supabaseConfigError || "the online service is unavailable."} Please contact the couple directly.`,
      );
      return;
    }

    setIsSubmitting(true);
    submissionInProgress.current = true;
    try {
      const { error } = await supabase.from("wedding_rsvps").insert({
        guest_name: guestName.trim(),
        mobile_number: normalizedMobile,
        number_of_guests: attendance === "joyfully_accept" ? parsedGuestCount : null,
        attendance_status:
          attendance === "joyfully_accept" ? "attending" : "not_attending",
        attending_events:
          attendance === "joyfully_accept"
            ? weddingDetails.events
                .filter(({ id }) => selectedCelebrations.includes(id))
                .map(({ name }) => name)
            : [],
      });

      if (error) {
        console.error("RSVP submission failed:", error.message);
        setErrorMessage("We could not save your RSVP. Please try again, or contact the hosts if this continues.");
        return;
      }

      setConfirmation(
        attendance === "joyfully_accept"
          ? "Your place in the celebration means the world to us. We cannot wait to see you!"
          : "Thank you for letting us know. You will be with us in spirit.",
      );
      setGuestName("");
      setMobileNumber("");
      setAttendance("");
      setGuestCount("");
      setSelectedCelebrations([]);
    } catch (error) {
      console.error("RSVP submission could not reach Supabase:", error);
      setErrorMessage("We could not send your RSVP. Please check your connection and try again.");
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rsvp-section" id="rsvp" aria-labelledby="rsvp-title">
      <div className="rsvp-ornament" aria-hidden="true">
        ✦
      </div>
      <p className="rsvp-eyebrow">YOUR PRESENCE IS OUR PRESENT</p>
      <h2 id="rsvp-title">Will You Join Our Celebration?</h2>
      <p className="rsvp-intro">
        Please let us know if you can share these joyful days with us.
      </p>

      <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
        <label className="rsvp-field">
          <span>Guest name <i aria-hidden="true">*</i></span>
          <input
            type="text"
            autoComplete="name"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            required
            maxLength={120}
            placeholder="Your name"
          />
        </label>

        <label className="rsvp-field">
          <span>Mobile number <i aria-hidden="true">*</i></span>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={mobileNumber}
            onChange={(event) => setMobileNumber(event.target.value)}
            required
            maxLength={24}
            placeholder="+91 98765 43210"
            aria-describedby="mobile-hint"
          />
          <small id="mobile-hint">Include your country code if you are outside India.</small>
        </label>

        <fieldset className="rsvp-attendance">
          <legend>Can you join us? <i aria-hidden="true">*</i></legend>
          <label>
            <input
              type="radio"
              name="attendance"
              value="joyfully_accept"
              checked={attendance === "joyfully_accept"}
              onChange={() => setAttendance("joyfully_accept")}
              required
            />
            <span>Joyfully Accept</span>
          </label>
          <label>
            <input
              type="radio"
              name="attendance"
              value="regretfully_decline"
              checked={attendance === "regretfully_decline"}
              onChange={() => {
                setAttendance("regretfully_decline");
                setGuestCount("");
                setSelectedCelebrations([]);
              }}
              required
            />
            <span>Regretfully Decline</span>
          </label>
        </fieldset>

        {attendance === "joyfully_accept" && (
          <>
            <label className="rsvp-field">
              <span>Number of guests attending <i aria-hidden="true">*</i></span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="2147483647"
                step="1"
                value={guestCount}
                onChange={(event) => setGuestCount(event.target.value)}
                required
                placeholder="How many guests?"
              />
            </label>

            <fieldset className="rsvp-celebrations">
              <legend>Which celebrations can you attend? <i aria-hidden="true">*</i></legend>
              <div>
                {celebrations.map((celebration) => (
                  <label key={celebration.id}>
                    <input
                      type="checkbox"
                      checked={selectedCelebrations.includes(celebration.id)}
                      onChange={() => toggleCelebration(celebration.id)}
                    />
                    <span>{celebration.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {errorMessage && (
          <p className="rsvp-message rsvp-message--error" role="alert">
            {errorMessage}
          </p>
        )}
        {confirmation && (
          <p className="rsvp-message rsvp-message--success" role="status">
            {confirmation}
          </p>
        )}

        <button className="rsvp-submit" type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "Sending your response..." : "Send Your RSVP"}</span>
          <i aria-hidden="true">
            {isSubmitting ? <span className="rsvp-loading-spinner" /> : "✦"}
          </i>
        </button>
      </form>

      <a
        className="rsvp-whatsapp"
        href={`https://wa.me/?text=${encodeURIComponent(
          `Join us to celebrate ${weddingDetails.bride} & ${weddingDetails.groom}!`,
        )}`}
        target="_blank"
        rel="noreferrer"
      >
        Share the invitation on WhatsApp
      </a>
    </section>
  );
}
