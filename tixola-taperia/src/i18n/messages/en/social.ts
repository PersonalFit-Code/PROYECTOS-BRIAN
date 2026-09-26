import type esSocial from "@/i18n/messages/es/social";
import type { Translation } from "./shape";

/**
 * "Social proof" section (#opiniones): heading, counters, marquee columns of real reviews,
 * Google / TripAdvisor links and photo gallery of the bar.
 * Placeholders like {rating} are filled with useFormat(): t(m.social.description, { rating, count }).
 */
const social = {
  kicker: "Social proof",
  title: "Take it from over 850",
  accent: "customers",
  description:
    "{rating} out of 5 on Google from {count} reviews, plus Travellers' Choice on TripAdvisor. The same things come up again and again: produce from the rías, iron skillets that arrive sizzling and a terrace with the Cathedral as a backdrop.",
  /** Rating summary next to the heading: "Google · 858 reviews" */
  ratingSummary: "Google · {count} reviews",
  stats: {
    reviews: "Customer reviews",
    reviewsSub: "on Google",
    rating: "Average rating",
    ratingSub: "Google · 858 reviews",
    rank: "For zamburiñas in the area",
    rankSub: "according to our customers",
    position: "Restaurant in Ourense",
    positionSub: "TripAdvisor · Travellers' Choice",
  },
  statsAria: "Tixola in numbers",
  reviewsTitle: "Word from",
  reviewsAccent: "those who've already been",
  reviewsNote:
    "Reviews published on TripAdvisor and Google, exactly as their authors wrote them. Five-star reviews only.",
  realReviews: "Real reviews",
  fiveStars: "Five stars",
  seeGoogle: "Read reviews on Google",
  seeTripadvisor: "See on TripAdvisor",
  pauseHint: "Hover to pause",
  /** Review columns (ReviewMarquee) */
  marquee: {
    label: "Customer reviews",
    summary: "{count} five-star customer reviews, published on TripAdvisor and Google.",
  },
  /** Review card (ReviewCard) */
  card: {
    stars: "{rating} out of 5 stars",
    on: "Review published on {source}",
    by: "Review by {author}",
    verified: "Verified review",
  },
  /** Platform links */
  platforms: {
    aria: "See more reviews",
    see: "See",
    reviews: "{count} reviews",
    rank: "No. {rank} of {total}",
  },
  /** Photo gallery (PhotoGallery) */
  gallery: {
    kicker: "Gallery",
    title: "Tixola in",
    accent: "pictures",
    description: "The bar, the terrace and the dishes just as they are: real photos, no filters, no retouching.",
    label: "Photo gallery of Tixola Tapería",
    prev: "Previous photo",
    next: "Next photo",
    goTo: "View photo {index}: {caption}",
    current: "current",
    open: "Enlarge photo: {caption}",
    hint: "Tap a photo to enlarge it",
    swipe: "Swipe to see more photos",
    pause: "Pause the gallery",
    play: "Resume the gallery",
    slide: "Photo {index} of {total}",
    /** Screen-reader announcement when the photo changes (only while the gallery is paused). */
    status: "Photo {index} of {total}: {caption}",
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
