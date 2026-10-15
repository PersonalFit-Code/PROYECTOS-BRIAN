import type esSocial from "@/i18n/messages/es/social";
import type { Translation } from "./shape";

/**
 * "Social proof" section (#opiniones): heading, links to the Google / TripAdvisor listings,
 * counters and photo gallery of the bar.
 * Placeholders like {rating} are filled with useFormat(): t(m.social.description, { rating, count }).
 */
const social = {
  kicker: "Social proof",
  title: "Take it from over {count}",
  accent: "customers",
  description:
    "The same things come up in review after review: produce from the rías, iron tixolas that arrive sizzling and a terrace with the Cathedral as a backdrop.",
  stats: {
    reviews: "Customer reviews",
    reviewsSub: "on Google",
    rating: "Average rating",
    ratingSub: "Google · {count} reviews",
    wines: "Wines on the list",
    winesSub: "Galician and beyond",
    platos: "Dishes on the menu",
    platosSub: "Traditional Galician cooking",
  },
  /** Word centred over the top rule of the figures band (SocialProof). */
  statsTitle: "In numbers",
  statsAria: "Tixola in numbers",
  reviewsNote:
    "The reviews stay where the people who wrote them put them: on Google and on TripAdvisor. That's where you can read them in full, and where they're always up to date.",
  seeGoogle: "Read reviews on Google",
  seeTripadvisor: "See us on TripAdvisor",
  /** Accessible label for the stars (PlatformBadge) */
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
    showLess: "See fewer",
    open: "Enlarge photo: {caption}",
    hint: "Tap or click a photo to enlarge it",
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
} satisfies Translation<typeof esSocial>;
export default social;
