import { normalizarCodigoBono } from "@/lib/vouchers/code";
import { firmaBonoValida, urlBono } from "@/lib/vouchers/enlaces";
import { qrPng } from "@/lib/vouchers/qr";

/**
 * GET /api/bonos/<code>/qr?t=<firma> → PNG con el QR del bono (para la página del bono y para
 * imprimirlo). Exige la firma, como la página: sin ella no se confirma que el código exista.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: crudo } = await params;
  const code = normalizarCodigoBono(decodeURIComponent(crudo));
  const firma = new URL(req.url).searchParams.get("t");
  if (!code || !firmaBonoValida(code, firma)) return new Response("No encontrado", { status: 404 });
  const png = await qrPng(urlBono(code), 640);
  return new Response(new Uint8Array(png), {
    headers: { "content-type": "image/png", "cache-control": "private, max-age=3600" },
  });
}
