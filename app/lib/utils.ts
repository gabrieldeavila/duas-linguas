import { clsx, type ClassValue } from "clsx";
import i18next from "i18next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const numberToLetter = (num: number) => {
  return String.fromCharCode(65 + num); // 0 -> A, 1 -> B, 2 -> C, etc.
};

export const tmeta = (key: unknown) => {
  // @ts-expect-error - key can be any type
  return i18next.t(key) ?? "...";
};
