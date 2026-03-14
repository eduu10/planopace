import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BLOB_ID = "019cedd6-e5f6-7890-9df3-ebcc175c0dac";
const BLOB_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;

async function getData(): Promise<Record<string, number>> {
  const res = await fetch(BLOB_URL, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return {};
  return await res.json();
}

async function saveData(data: Record<string, number>) {
  await fetch(BLOB_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { event } = await req.json();
    if (!event || typeof event !== "string") {
      return NextResponse.json({ error: "Missing event" }, { status: 400 });
    }

    const data = await getData();
    data[event] = (data[event] ?? 0) + 1;
    await saveData(data);

    return NextResponse.json({ count: data[event] });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const event = req.nextUrl.searchParams.get("event");
    const data = await getData();

    if (event) {
      return NextResponse.json({ count: data[event] ?? 0 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
