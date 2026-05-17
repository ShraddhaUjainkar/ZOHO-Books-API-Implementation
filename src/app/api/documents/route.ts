import { NextRequest, NextResponse } from "next/server";
import { getCookies } from "@/src/lib/cookies";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const entity = searchParams.get("entity");
  const id = searchParams.get("id");
  const docId = searchParams.get("docId");

  if (!entity || !id || !docId) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  const orgId = process.env.ZOHO_ORG_ID;
  const token = await getCookies("access_token");

  // GET /books/v3/{entity}/{id}/documents/{docId}
  const url = `${process.env.ZOHO_API_BASE_URL}/${entity}/${id}/documents/${docId}?organization_id=${orgId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
      },
    });

    if (!response.ok) {
      return new NextResponse(`Zoho API error: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const zohoDisposition = response.headers.get("content-disposition");

    // Extract filename from Zoho's header, or fallback to docId
    const filename =
      zohoDisposition?.match(/filename="?([^"]+)"?/)?.[1] ??
      `document-${docId}`;

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    // Force download instead of opening in a browser tab
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
