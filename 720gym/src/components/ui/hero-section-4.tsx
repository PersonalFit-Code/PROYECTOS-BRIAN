"use client";

/**
 * Portada a pantalla completa (adaptada de «hero-section-4»): foto limpia de fondo con un velo
 * suave, título, subtítulo y botones que entran escalonados con framer-motion.
 * Diferencias con el original: la foto va con next/image (prioridad y tamaños, sin perder calidad),
 * respeta «reducir movimiento», admite contenido extra debajo de los botones y usa next/link.
 */
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeroSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  eyebrow?: React.ReactNode;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
  imageUrl: string;
  imageAlt?: string;
  /** Encuadre de la foto (p. ej. «object-[62%_50%]») para que en móvil se vea lo importante. */
  imageClassName?: string;
  /** Lo que va bajo los botones (p. ej. el enlace de WhatsApp). */
  extra?: React.ReactNode;
}

const contenedor = (retraso: number): Variants => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.16, delayChildren: retraso } },
});

const itemVariants: Variants = {
  hidden: { y: 22, opacity: 0, filter: "blur(6px)" },
  visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  ({ className, title, subtitle, eyebrow, primaryButtonText, primaryButtonHref, secondaryButtonText, secondaryButtonHref, imageUrl, imageAlt = "", imageClassName, extra, ...props }, ref) => {
    const reducir = useReducedMotion();
    /* Si la portada arranca con la intro del «720», el texto entra cuando la intro termina. */
    const [conIntro] = React.useState(() => typeof document !== "undefined" && document.documentElement.hasAttribute("data-intro"));
    return (
      <section ref={ref} className={cn("relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-negro", className)} {...props}>
        {/* Foto de fondo: entra con un leve acercamiento y se queda quieta (sin zoom al hacer scroll). */}
        <motion.div className="hero-fondo absolute inset-0 -z-20" initial={reducir ? false : { scale: 1.1 }} animate={{ scale: 1 }} transition={conIntro ? { duration: 0 } : { duration: 1.6, ease: [0.16, 1, 0.3, 1] }} aria-hidden="true">
          <Image src={imageUrl} alt={imageAlt} fill priority sizes="100vw" quality={90} className={cn("object-cover", imageClassName)} />
        </motion.div>
        {/* Velo suave para leer el texto sin apagar la foto. */}
        <div className="absolute inset-0 -z-10 bg-black/35" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />

        <motion.div className="z-10 flex max-w-4xl flex-col items-center px-5 pt-[var(--header-h,4rem)] text-center text-white" variants={contenedor(conIntro ? 0.9 : 0.25)} initial={reducir ? false : "hidden"} animate="visible">
          {eyebrow && (
            <motion.div variants={itemVariants} className="mb-5">
              {eyebrow}
            </motion.div>
          )}
          <motion.h1 className="titular text-[clamp(2.8rem,8vw,5.6rem)] leading-[0.95]" variants={itemVariants}>
            {title}
          </motion.h1>
          <motion.p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-white/85 md:text-[19px]" variants={itemVariants}>
            {subtitle}
          </motion.p>
          <motion.div className="mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4" variants={itemVariants}>
            <Button asChild size="lg">
              <Link href={primaryButtonHref}>{primaryButtonText}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="text-white">
              <Link href={secondaryButtonHref}>{secondaryButtonText}</Link>
            </Button>
          </motion.div>
          {extra && (
            <motion.div variants={itemVariants} className="mt-6">
              {extra}
            </motion.div>
          )}
        </motion.div>
      </section>
    );
  },
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
