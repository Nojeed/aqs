import "server-only";
import type { L10n } from "./i18n";
import { REGISTRATIONS_FILE, sessionKey, upcomingSessions, type Course, type Registration } from "./schema";
import { readJson } from "./storage";

export type SessionAvailability = { key: string; date: string; location: L10n; seats: number; left: number | null };

/** Upcoming sessions of a course with seats left (null = no limit). Cancelled registrations free their seats. */
export async function sessionAvailability(course: Pick<Course, "id" | "sessions">): Promise<SessionAvailability[]> {
  const sessions = upcomingSessions(course.sessions);
  if (!sessions.length) return [];
  const registrations = await readJson<Registration[]>(REGISTRATIONS_FILE);
  return sessions.map((s) => {
    const key = sessionKey(s);
    const taken = registrations
      .filter((r) => r.courseId === course.id && r.session === key && r.status !== "cancelled")
      .reduce((n, r) => n + (r.type === "company" ? (r.trainees ?? 1) : 1), 0);
    return { key, date: s.date, location: s.location, seats: s.seats, left: s.seats > 0 ? Math.max(0, s.seats - taken) : null };
  });
}
