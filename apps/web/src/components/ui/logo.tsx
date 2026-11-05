import Image from "next/image";

export function Logo({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <Image
      src={onDark ? "/logos/prosparity-on-dark.svg" : "/logos/prosparity.svg"}
      alt=""
      width={306}
      height={70}
      unoptimized
      className={className ?? "h-8 w-auto"}
    />
  );
}
