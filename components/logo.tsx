"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  href?: string | null;
}

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      {/* Folder body in brand Blue #2F5BFF */}
      <path
        d="M10 80V24H36L46 36H90V80Z"
        fill="#2F5BFF"
      />
      {/* House silhouette inside in White #FFFFFF */}
      {/* Roof */}
      <path d="M35 60L50 46L65 60Z" fill="#FFFFFF" />
      {/* Base */}
      <path d="M40 60H60V75H40Z" fill="#FFFFFF" />
      {/* Door cutout in Blue #2F5BFF */}
      <path d="M47 67H53V75H47Z" fill="#2F5BFF" />
    </svg>
  );
}

export function Logo({
  className,
  iconClassName = "h-7 w-7",
  textClassName = "text-xl font-bold tracking-tight",
  showText = true,
  href = "/",
}: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <LogoIcon className={iconClassName} />
      {showText && (
        <span className={cn("font-sans dark:text-white", textClassName || "text-foreground")}>
          Archi<span className="text-[#2F5BFF]">Vault<sup className="text-[9px] select-none ml-0.5 font-bold align-super">TM</sup></span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
