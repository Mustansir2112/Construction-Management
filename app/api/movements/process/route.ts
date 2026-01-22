import { NextResponse } from "next/server";
import { processMovement } from "@/lib/movementEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item_id, from_zone, to_zone } = body;

    if (!item_id || !from_zone || !to_zone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await processMovement({
      item_id,
      from_zone,
      to_zone,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error processing movement:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process movement" },
      { status: 500 }
    );
  }
}
