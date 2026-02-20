const KEY = "rentcars:userEmail";

export function getCurrentUserEmail() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) ?? "";
}

export function setCurrentUserEmail(email: string) {
  localStorage.setItem(KEY, email);
}