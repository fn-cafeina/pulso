import { useEffect } from "react";
import { isAuthenticated } from "../../lib/api";

export default function AuthGuard() {
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
    }
  }, []);

  return null;
}
