import { cookies } from "next/headers";

export async function getValidAccessToken() {
    const cookieStore = await cookies();
    
    // 1. Check if we already have a valid access token
    const accessToken = cookieStore.get("zoho_access_token")?.value;
    if (accessToken) {
        return accessToken;
    }

    // 2. If no access token (or it expired), grab the refresh token
    const refreshToken = cookieStore.get("zoho_refresh_token")?.value;
    if (!refreshToken) {
        throw new Error("No refresh token available. User must re-authenticate.");
    }

    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Server missing Zoho credentials (ZOHO_CLIENT_ID or ZOHO_CLIENT_SECRET)");
    }

    // 3. Request a new access token from Zoho using the refresh token
    const response = await fetch("https://accounts.zoho.in/oauth/v2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "refresh_token",
        }),
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(`Failed to refresh token: ${data.error}`);
    }

    // 4. Save the newly minted access token into our cookies
    if (data.access_token) {
        cookieStore.set("zoho_access_token", data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: data.expires_in || 3600, // Usually expires in 3600 seconds (1 hour)
            path: "/",
        });
        
        return data.access_token;
    }

    throw new Error("Invalid response from Zoho when refreshing token");
}
