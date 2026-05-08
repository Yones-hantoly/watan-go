import { redirect } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth";

const LOGIN_REQUIRED_MESSAGE_KEY = "watan_go_login_required_message";
const LOGIN_REQUIRED_MESSAGE = "Please log in to access this section.";

export function requireAuthForProtectedRoute() {
  if (typeof window === "undefined") return;
  if (getAuth()) return;

  sessionStorage.setItem(LOGIN_REQUIRED_MESSAGE_KEY, LOGIN_REQUIRED_MESSAGE);
  throw redirect({ to: "/login" });
}

export function consumeLoginRequiredMessage() {
  if (typeof window === "undefined") return null;

  const message = sessionStorage.getItem(LOGIN_REQUIRED_MESSAGE_KEY);
  if (message) {
    sessionStorage.removeItem(LOGIN_REQUIRED_MESSAGE_KEY);
  }
  return message;
}
