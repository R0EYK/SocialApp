import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function resolveMediaUrl(source?: string): string | undefined {
  if (!source) return undefined;
  if (source.startsWith("http://") || source.startsWith("https://")) {
    return source;
  }

  if (source.startsWith("/")) {
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (!apiUrl) return source;
    return `${apiUrl.replace(/\/+$/, "")}${source}`;
  }

  return source;
}
