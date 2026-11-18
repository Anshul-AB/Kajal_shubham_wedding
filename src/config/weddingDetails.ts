
import KS_1 from "../assets/images/KS_1.jpeg";
import KS_2 from "../assets/images/KS_2.jpeg";
import KS_3 from "../assets/images/KS_3.jpeg";
import KS_4 from "../assets/images/KS_4.jpeg";
import KS_5 from "../assets/images/KS_5.jpeg";

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

  families: {
    bride: {
      fatherName: "",
      motherName: "",
    },
    groom: {
      fatherName: "",
      motherName: "",
    },
  },

  photographs: {
    main: KS_1,
    fullLength: KS_4,
    romantic: KS_2,
    family: KS_3,
    cocktail: KS_5,
    haldi: KS_3,
    mehendi: KS_2,
    wedding: KS_4,
  },

  venue: {
    name: "Tashan",
    city: "Pathankot",
    state: "Punjab",
    country: "India",
  },

  events: [
    {
      id: "cocktail",
      name: "Cocktail",
      accent: "#684B78",
      date: "2026-11-23",
      time: "8:00 PM",
      location: "Celebration Rooms and Banquet, Pathankot",
    },
    {
      id: "haldi",
      name: "Haldi",
      accent: "#E8B94F",
      date: "2026-11-24",
      time: "11:00 AM",
      location: "Celebration Rooms and Banquet, Pathankot",
    },
    {
      id: "mehendi",
      name: "Mehendi",
      accent: "#708B65",
      date: "2026-11-24",
      time: "7:00 PM",
      location: "Celebration Rooms and Banquet, Pathankot",
    },
    { id: "wedding", name: "Wedding", accent: "#503845", time: "8:00 PM" },
  ] satisfies WeddingEvent[],
};
