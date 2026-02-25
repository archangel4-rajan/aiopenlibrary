import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json(
      { error: "ids parameter is required" },
      { status: 400 }
    );
  }

  const ids = idsParam.split(",").filter((id) => id.trim()).slice(0, 100); // Cap at 100 IDs

  if (ids.length === 0) {
    return NextResponse.json({
      prompts: [],
    });
  }

  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .in("id", ids)
    .eq("is_published", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    prompts: data ?? [],
  });
}
