import { BUSINESS } from "@/content";

/* Iconos propios (lucide ya no trae logos de marcas). */
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.2c-1.5.1-2.8-.3-4-1.1v6.1c0 3.5-2.6 5.9-5.8 5.9A5.7 5.7 0 0 1 5 15.2c0-3.5 3-6 6.5-5.6v3.3c-1.6-.4-3.2.6-3.2 2.3 0 1.4 1.1 2.4 2.5 2.4 1.5 0 2.6-1 2.6-2.9V3h3.2z" />
    </svg>
  );
}

export const SOCIALS = [
  { name: "Instagram", handle: "@bhtacos", href: BUSINESS.social.instagram, Icon: InstagramIcon },
  { name: "TikTok", handle: "@bhtacos", href: BUSINESS.social.tiktok, Icon: TikTokIcon },
] as const;

export default function SocialLinks() {
  return (
    <ul className="flex gap-3">
      {SOCIALS.map(({ name, href, Icon }) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} de BH Tacos`}
            className="press grid h-11 w-11 place-items-center rounded-full border border-line text-fg hover:border-brand hover:text-brand-text"
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
