import { getCourses } from "@/lib/content";
import { sessionAvailability } from "@/lib/sessions";

/** Upcoming dates and seats left for a published course. Live (not cached): seats change with every registration. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("course") ?? "";
  const course = (await getCourses()).find((c) => c.id === id);
  if (!course) return Response.json({ sessions: [] }, { status: 404 });
  return Response.json({ sessions: await sessionAvailability(course) }, { headers: { "Cache-Control": "no-store" } });
}
