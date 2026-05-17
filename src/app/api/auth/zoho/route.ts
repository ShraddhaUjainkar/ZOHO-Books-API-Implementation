import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new NextResponse("Missing ZOHO_CLIENT_ID or ZOHO_REDIRECT_URI", {
      status: 500,
    });
  }

  const scope = "ZohoBooks.fullaccess.all,ZohoBooks.reports.READ";
  const authUrl = `https://accounts.zoho.in/oauth/v2/auth?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
