import { NextResponse } from "next/server";
import { getAirFreshenerPageDataFromStore } from "@/lib/air-fresheners-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAirFreshenerPageDataFromStore();
  return NextResponse.json(data);
}

