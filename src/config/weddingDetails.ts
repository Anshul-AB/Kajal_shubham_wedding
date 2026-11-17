
export type WeddingEventId = "cocktail" | "haldi" | "mehendi" | "wedding";

export type WeddingEvent = {
  id: WeddingEventId;
  name: string;
  accent: string;
  date?: string;
  time?: string;
  location?: string;
};

export const weddingDetails = {
  bride: "Kajal",
  groom: "Shubham",
  weddingDate: "2026-11-25",

  venue: {
    name: "Tashan",
    city: "Pathankot",
    state: "Punjab",
    country: "India",
  },

  events: [
    { id: "cocktail", name: "Cocktail", accent: "#684B78" },
    { id: "haldi", name: "Haldi", accent: "#E8B94F" },
    { id: "mehendi", name: "Mehendi", accent: "#708B65" },
    { id: "wedding", name: "Wedding", accent: "#503845" },
  ] satisfies WeddingEvent[],
};
