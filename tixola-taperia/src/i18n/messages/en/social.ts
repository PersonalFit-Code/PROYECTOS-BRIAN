import type esSocial from "@/i18n/messages/es/social";
import type { Translation } from "./shape";

/**
 * "Social proof" section (#opiniones): heading, counters, marquee columns of real reviews,
 * Google / TripAdvisor links and photo gallery of the bar.
 * Placeholders like {rating} are filled with useFormat(): t(m.social.description, { rating, count }).
 */
const social = {
  kicker: "Social proof",
  title: "Take it from over {count}",
  accent: "customers",
  description:
    "{rating} out of 5 on Google from {count} reviews, plus Travellers' Choice on TripAdvisor. The same things come up again and again: produce from the rías, iron skillets that arrive sizzling and a terrace with the Cathedral as a backdrop.",
  /** Rating summary next to the heading: "Google · 858 reviews" */
  ratingSummary: "Google · {count} reviews",
  stats: {
    reviews: "Customer reviews",
    reviewsSub: "on Google",
    rating: "Average rating",
    ratingSub: "Google · {count} reviews",
    wines: "Wines on the list",
    winesSub: "Galician and beyond",
    platos: "Dishes on the menu",
    platosSub: "Galician cooking, as always",
  },
  /** Word centred over the top rule of the figures band (SocialProof). */
  statsTitle: "In numbers",
  statsAria: "Tixola in numbers",
  reviewsTitle: "Word from",
  reviewsAccent: "those who've already been",
  reviewsNote:
    "What people say is where they wrote it: on Google and TripAdvisor. That is where you can read it in full and up to date.",
  seeGoogle: "Read reviews on Google",
  seeTripadvisor: "See on TripAdvisor",
  /** Review card (ReviewCard) */
  card: {
    stars: "{rating} out of 5 stars",
  },
  /** Platform links */
  platforms: {
    aria: "See more reviews",
    see: "See",
    reviews: "{count} reviews",
  },
  /** Photo gallery (PhotoGallery) */
  gallery: {
    kicker: "Gallery",
    title: "Tixola in",
    accent: "pictures",
    description: "The bar, the terrace and the dishes just as they are: real photos, no filters, no retouching.",
    label: "Photo gallery of Tixola Tapería",
    count: "{count} photos",
    themesAria: "Filter the gallery by theme",
    themes: {
      all: "All",
      plato: "Dishes",
      local: "The bar",
      vinos: "Wines",
      terraza: "Terrace",
    },
    showAll: "See all {count} photos",
    showLess: "Show fewer",
    open: "Enlarge photo: {caption}",
    hint: "Tap a photo to enlarge it",
    /** Full-screen viewer */
    lightbox: {
      label: "Enlarged photo: {caption}",
      close: "Close enlarged photo",
      prev: "Previous photo",
      next: "Next photo",
      counter: "{index} of {total}",
      hint: "Escape to close · arrow keys to change photo",
    },
  },
  verified: "Verified review",
} satisfies Translation<typeof esSocial>;
export default social;
