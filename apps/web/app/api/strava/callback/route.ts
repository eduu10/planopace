import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Strava API não configurada no servidor" },
      { status: 500 }
    );
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Erro desconhecido" }));
    return NextResponse.json(
      { error: error.message || `Erro Strava: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();

  return NextResponse.json({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athlete: {
      id: data.athlete?.id,
      firstName: data.athlete?.firstname,
      lastName: data.athlete?.lastname,
      profilePicture: data.athlete?.profile,
      city: data.athlete?.city,
      country: data.athlete?.country,
    },
  });
}
