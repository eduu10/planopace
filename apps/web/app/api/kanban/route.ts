import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BLOB_ID = "019cb064-6919-728f-a312-f3cceb9bec48";
const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;

export async function GET() {
  const res = await fetch(BLOB_URL, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ tasks: [], notifications: [], initialized: false }, { status: 200 });
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
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
