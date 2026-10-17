import "server-only";
import { isAdmin } from "./auth";

/** Guards admin route handlers: valid session + same-origin request for writes. */
export async function adminGuard(request: Request): Promise<Response | null> {
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return Response.json({ error: "Cross-origin request blocked." }, { status: 403 });
    }
  }
  if (!(await isAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });
  return null;
}
