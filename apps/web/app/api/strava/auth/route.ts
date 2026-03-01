import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://planopace.vercel.app"}/auth/strava/callback`;
  const scopes = "read,activity:read_all";

  if (!clientId) {
    return NextResponse.json(
      { error: "Strava API não configurada" },
      { status: 500 }
    );
  }

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&approval_prompt=auto`;

  return NextResponse.json({ url: authUrl });
}
