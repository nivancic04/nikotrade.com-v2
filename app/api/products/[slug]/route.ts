import { NextResponse } from "next/server";
import { getProductBySlugFromStore } from "@/lib/products-store";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const product = await getProductBySlugFromStore(slug);

  if (!product) {
    return NextResponse.json({ error: "Proizvod nije pronađen." }, { status: 404 });
  }

  return NextResponse.json({ product });
}
