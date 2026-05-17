import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return new NextResponse("Authorization code not found", { status: 400 });
    }

    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const redirectUri = process.env.ZOHO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        return new NextResponse("Server missing Zoho credentials", { status: 500 });
    }

    try {
        const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const data = await response.json();

        if (data.error) {
            return new NextResponse(`Error from Zoho: ${data.error}`, { status: 400 });
        }

        // Store tokens securely. For this prototype, we'll store the refresh token in an HTTP-only cookie.
        if (data.refresh_token) {
            const cookieStore = await cookies();
            cookieStore.set("zoho_refresh_token", data.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 365, // 1 year
                path: "/",
            });
        }
        
        if (data.access_token) {
            const cookieStore = await cookies();
            cookieStore.set("zoho_access_token", data.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: data.expires_in || 3600, // Typically 1 hour
                path: "/",
            });
        }

        // Redirect back to the dashboard
        return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
        console.error("Error exchanging code for token:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
