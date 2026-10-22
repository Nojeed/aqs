import Link from "next/link";
import { SearchX } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <SearchX className="size-10 text-slate-400" aria-hidden />
      <h1 className="font-display mt-4 text-2xl font-bold">Not found</h1>
      <p className="mt-2 text-slate-500">This item doesn&apos;t exist anymore. It may have been deleted or renamed.</p>
      <Link href="/admin" className="btn-primary mt-6 rounded-lg px-4 py-2">
        Back to the dashboard
      </Link>
    </div>
  );
}
