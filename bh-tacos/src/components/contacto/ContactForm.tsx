"use client";

import Link from "next/link";
import { useState } from "react";
import { BUSINESS } from "@/content";

/** Sin servidor: al enviar se abre el programa de correo con el mensaje ya escrito (mailto:). */
export default function ContactForm() {
  const [error, setError] = useState("");
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email || !message) {
      setError("Rellena los tres campos, por favor.");
      return;
    }
    setError("");
    const subject = `Mensaje desde la web · ${name}`;
    const body = `${message}\n\n— ${name} (${email})`;
    window.location.href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const field = "mt-1 w-full rounded-xl border border-line bg-bg px-4 py-3 text-fg placeholder:text-fg-muted/70 focus-visible:border-brand";
  return (
    <form onSubmit={onSubmit} noValidate className="card grid gap-4 p-6">
      <label className="font-semibold">
        Nombre
        <input name="name" autoComplete="name" required className={field} />
      </label>
      <label className="font-semibold">
        Email
        <input name="email" type="email" autoComplete="email" required className={field} />
      </label>
      <label className="font-semibold">
        Mensaje
        <textarea name="message" rows={5} required className={field} />
      </label>
      <p role="alert" className="min-h-5 text-sm text-brand-text">
        {error}
      </p>
      <button type="submit" className="press btn btn-primary">
        Enviar
      </button>
      <p className="text-sm text-fg-muted">
        Al enviar aceptas nuestra{" "}
        <Link href="/privacidad" className="underline underline-offset-4 hover:text-fg">
          política de privacidad
        </Link>
        .
      </p>
    </form>
  );
}
