"use client";

import Image from "next/image";
import { useRef } from "react";

interface Props {
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  linkedin?: string;
  size: "large" | "small";
  labels: { open: string; close: string; linkedin: string };
}

function Portrait({ name, photo, sizes, className }: { name: string; photo: string | null; sizes: string; className: string }) {
  return photo ? (
    <Image src={photo} alt="" width={472} height={472} sizes={sizes} className={className} />
  ) : (
    <span aria-hidden="true" className="flex size-full items-center justify-center text-6xl font-[540] text-forest">{name.charAt(0)}</span>
  );
}

export function LinkedInChip({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" aria-label={label} className={`flex size-11 items-center justify-center rounded-control bg-forest text-[15px] font-bold text-white ${className}`}>
      <span aria-hidden="true">in</span>
    </a>
  );
}

export function TeamCard({ name, role, bio, photo, linkedin, size, labels }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const large = size === "large";
  const linkedinLabel = `${name}, ${labels.linkedin}`;

  return (
    <>
      <div className="team-card relative h-full overflow-hidden rounded-panel bg-sage">
        <button type="button" onClick={() => dialog.current?.showModal()} aria-label={`${labels.open}: ${name}`} className="flex h-full w-full cursor-pointer flex-col text-left">
          <span className={`relative block w-full overflow-hidden ${large ? "aspect-[6/5]" : "aspect-square"}`}>
            <span className="absolute inset-0 flex items-end justify-center">
              <Portrait name={name} photo={photo} sizes={large ? "(min-width: 768px) 560px, 100vw" : "(min-width: 1024px) 300px, 50vw"} className="team-photo h-full w-auto max-w-none object-contain object-bottom" />
            </span>
          </span>
          <span className={`block flex-1 bg-white ${large ? "p-5" : "p-3"}`}>
            <span className={`block text-forest ${large ? "t-subhead" : "font-[540] leading-snug"}`}>{name}</span>
            <span className={`mt-0.5 block text-slate ${large ? "" : "t-small"}`}>{role}</span>
          </span>
        </button>
        {linkedin && <LinkedInChip href={linkedin} label={linkedinLabel} className="absolute right-3 top-3" />}
      </div>

      <dialog
        ref={dialog}
        aria-label={name}
        className="team-dialog m-auto w-[min(640px,calc(100vw-32px))] rounded-panel bg-white p-0 text-deep backdrop:bg-deep/60"
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
      >
        <div className="grid sm:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative h-56 overflow-hidden bg-sage sm:h-auto">
            <div className="absolute inset-0 flex items-end justify-center">
              <Portrait name={name} photo={photo} sizes="240px" className="h-full w-auto max-w-none object-contain object-bottom" />
            </div>
          </div>
          <div className="p-6">
            <h3 className="t-heading text-forest">{name}</h3>
            <p className="mt-1 text-slate">{role}</p>
            <p className="mt-4">{bio}</p>
            <div className="mt-5 flex items-center gap-3">
              {linkedin && <LinkedInChip href={linkedin} label={linkedinLabel} />}
              <button type="button" onClick={() => dialog.current?.close()} className="btn btn-primary btn-sm">{labels.close}</button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
