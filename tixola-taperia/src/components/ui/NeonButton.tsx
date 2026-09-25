"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "cream";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  pulse?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AnchorProps = BaseProps & { href: string; target?: string; rel?: string; onClick?: () => void; "aria-label"?: string };
export type NeonButtonProps = ButtonProps | AnchorProps;

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold tracking-wide transition-all duration-300 ease-[var(--ease-out-expo)] will-change-transform select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pimenton-light focus-visible:ring-offset-2 focus-visible:ring-offset-iron disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-pimenton text-cream border border-pimenton-light/60 hover:bg-pimenton-light hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(216,50,60,0.75)] active:translate-y-0",
  ghost: "bg-transparent text-cream hover:bg-cream/10 border border-transparent",
  outline:
    "bg-transparent text-cream border border-cream/30 hover:border-cream/70 hover:bg-cream/5 hover:-translate-y-0.5 backdrop-blur-sm",
  cream: "bg-cream text-iron border border-cream hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(249,246,240,0.35)]",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-base md:text-lg",
};

/**
 * Botón CTA con "pulso neón rojo" (variant="primary" pulse).
 * Renderiza <a> (next/link) si recibe `href`, si no <button>.
 */
const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(function NeonButton(props, ref) {
  const { variant = "primary", size = "md", pulse = false, icon, iconRight, className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], pulse && variant === "primary" && "animate-neon-pulse", className);

  const content = (
    <>
      {/* brillo interior deslizante */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        <span className="absolute -inset-y-2 -left-1/2 w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
      </span>
      {icon && <span className="relative -ml-1 shrink-0 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}
      <span className="relative">{children}</span>
      {iconRight && (
        <span className="relative -mr-1 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 [&>svg]:h-5 [&>svg]:w-5">
          {iconRight}
        </span>
      )}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, target, rel, onClick, ...aria } = rest as AnchorProps;
    const external = /^(https?:|tel:|mailto:)/.test(href);
    if (external) {
      return (
        <a href={href} target={target} rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)} onClick={onClick} className={classes} {...aria}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} onClick={onClick} className={classes} {...aria}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...btn } = rest as ButtonProps;
  return (
    <button ref={ref} type={type} className={classes} {...btn}>
      {content}
    </button>
  );
});

export default NeonButton;
