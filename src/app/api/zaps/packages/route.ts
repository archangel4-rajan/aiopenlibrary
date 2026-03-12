import { NextResponse } from "next/server";
import { getZapPackages } from "@/lib/db";

export async function GET() {
  try {
    const packages = await getZapPackages();
    return NextResponse.json(packages);
  } catch (err) {
    console.error("GET /api/zaps/packages error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
