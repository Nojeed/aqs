import Image from "next/image";
import mark from "../../public/brand/logo-mark.png";
import markLight from "../../public/brand/logo-mark-light.png";

export function Logo({
  variant = "dark",
  name = "AQS",
  tagline,
  className = "",
}: {
  variant?: "dark" | "light";
  name?: string;
  tagline?: string;
  className?: string;
}) {
  const light = variant === "light";
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Image
        src={light ? markLight : mark}
        alt=""
        priority
        className="h-10 w-auto shrink-0 transition-[filter] duration-300"
        sizes="60px"
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-xl font-extrabold tracking-wide ${light ? "text-white" : "text-brand-900"}`}
        >
          {name}
        </span>
        {tagline && (
          <span
            className={`mt-1 hidden text-[10px] font-semibold sm:block tracking-[0.14em] uppercase ${light ? "text-white/70" : "text-silver-500"}`}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
