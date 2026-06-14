import { cn } from "@/lib/utils";

interface DecentLogoProps {
  size?: number;
  className?: string;
}

export function DecentLogo({ size = 36, className }: DecentLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/decentlogo1k.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden
      decoding="async"
    />
  );
}
