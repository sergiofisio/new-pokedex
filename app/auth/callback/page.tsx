import type { Metadata } from "next";
import AuthCallback from "../../components/auth/authCallback";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthCallbackPage() {
  return <AuthCallback />;
}
