import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOB_ID = "019ccab7-7e68-746c-b568-fe9c15edb8ed";
const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;

export async function GET() {
  try {
    const res = await fetch(BLOB_URL, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      // Signal to the client that the cloud is unavailable
      return NextResponse.json({ error: "Cloud unavailable" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ error: "Cloud unavailable" }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(BLOB_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
