import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseYear = (dateText?: string | null) => {
  if (!dateText) {
    return null;
  }

  const parsedDate = new Date(dateText);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.getFullYear();
};
