import { cookies } from "next/headers";
type Key = "access_token" | "refresh_token";

export async function getCookies(key: Key) {
  const cookieStore = await cookies();

  if (key === "access_token") {
    const token = cookieStore.get("zoho_access_token")?.value;
    return token;
  } else if (key === "refresh_token") {
    const token = cookieStore.get("zoho_refresh_token")?.value;
    return token;
  }
  return null;
}
