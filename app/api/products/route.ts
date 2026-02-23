import { NextResponse } from "next/server";
import { getAllProductsFromStore } from "@/lib/products-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getAllProductsFromStore();
  return NextResponse.json({ products });
}
