import { SOCIALS } from "@/components/common/SocialLinks";

export default function SocialGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {SOCIALS.map(({ name, handle, href, Icon }) => (
        <li key={name}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="card lift press flex items-center gap-4 p-5">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white">
              <Icon />
            </span>
            <span>
              <span className="block font-display text-2xl uppercase">{name}</span>
              <span className="text-fg-muted">{handle}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
