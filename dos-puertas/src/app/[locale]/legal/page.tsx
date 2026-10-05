import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const m = getMessages(isLocale(raw) ? raw : "es");
  return (
    <div className="container-page max-w-2xl pt-36 pb-20">
      <h1 className="font-display text-4xl font-medium">{m.legal.title}</h1>
      <p className="mt-4 text-cream-muted">{m.legal.text}</p>
    </div>
  );
}
