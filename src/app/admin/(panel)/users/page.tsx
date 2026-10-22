import type { Metadata } from "next";
import { UsersManager } from "@/components/admin/users-manager";
import { requireOwner } from "@/lib/auth";
import { ownerUsername, readUsers } from "@/lib/users";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const me = await requireOwner();
  const stored = await readUsers();
  const owner = ownerUsername();
  // The server owner account shows even before its password was ever changed in the admin.
  const rows = [
    ...(stored.some((u) => u.username === owner) ? [] : [{ username: owner, name: "Owner", role: "owner" as const, fromServer: true }]),
    ...stored.map(({ username, name, role, changedAt }) => ({ username, name, role, changedAt, fromServer: username === owner })),
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold">Users</h1>
      <p className="mt-1 max-w-2xl text-slate-500">
        Everyone who can sign in to the admin. Staff can edit content, certificates and the inbox; owners can also manage users and
        see the activity log.
      </p>
      <div className="mt-8">
        <UsersManager users={rows} me={me.username} />
      </div>
    </div>
  );
}
