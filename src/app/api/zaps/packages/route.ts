import { NextResponse } from "next/server";
import { getZapPackages } from "@/lib/db";

export async function GET() {
  const packages = await getZapPackages();
  return NextResponse.json(packages);
}
