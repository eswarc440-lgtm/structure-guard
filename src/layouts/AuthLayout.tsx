import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/common/Logo";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy p-10 text-navy-foreground lg:flex">
        <div className="grid-lines absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <Logo tone="light" />
        <div className="relative max-w-md">
          <p className="eyebrow text-accent">Monitor. Predict. Protect.</p>
          <h2 className="mt-4 font-display text-4xl leading-tight font-bold text-balance">
            Infrastructure intelligence for safer decisions.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-foreground/65">
            SIMRAS unifies structural monitoring, AI risk prediction, GIS and digital twin technology into a single
            operational platform.
          </p>
        </div>
        <p className="relative text-xs text-navy-foreground/40">
          Structural Infrastructure Monitoring and Risk Assistance System
        </p>
      </div>

      <div className="flex min-w-0 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 font-display text-2xl font-bold tracking-tight lg:mt-0 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
          <p className="mt-10 text-xs text-muted-foreground">
            <Link to="/" className="underline underline-offset-4 hover:text-foreground">
              Back to SIMRAS home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
