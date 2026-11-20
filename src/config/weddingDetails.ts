
import KS_1 from "../assets/images/KS_1.jpeg";
import KS_2 from "../assets/images/KS_2.jpeg";
import KS_3 from "../assets/images/KS_3.jpeg";
import KS_4 from "../assets/images/KS_4.jpeg";
import KS_5 from "../assets/images/KS_5.jpeg";
import KS_6 from "../assets/images/KS_6.jpeg";
import KS_7 from "../assets/images/KS_7.jpeg";
import KS_8 from "../assets/images/KS_8.jpeg";
import KS_9 from "../assets/images/KS_9.jpeg";

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
    fullLength: KS_7,
    romantic: KS_2,
    familyOne: KS_6,
    familyTwo: KS_5,
    cocktail: KS_9,
    haldi: KS_3,
    mehendi: KS_8,
    wedding: KS_4,
  },

  venue: {
    name: "Jasshan",
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
