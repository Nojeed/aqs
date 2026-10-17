import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin/login-form";
import { authConfigError } from "@/lib/auth";
import mark from "../../../../public/brand/logo-mark.png";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const configError = authConfigError();
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-900 lg:block">
        <Image src="/images/lab-microscope.jpg" alt="" fill sizes="50vw" className="object-cover opacity-30" priority />
        <div className="bg-lines absolute inset-0" aria-hidden />
        <div className="absolute inset-x-12 bottom-12 text-white">
          <p className="font-display text-3xl font-bold text-white">Quality Today, Excellence Always</p>
          <p className="mt-3 text-white/70">Manage the AQS website content, courses, blog and certificates.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Image src={mark} alt="AQS" className="h-14 w-auto" priority />
          <h1 className="font-display mt-8 text-2xl font-bold">Sign in to the admin panel</h1>
          <p className="mt-2 text-sm text-slate-500">Use the credentials set in your server environment.</p>
          {configError && (
            <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
              {configError} Add it to your environment (see README) and restart the server.
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
