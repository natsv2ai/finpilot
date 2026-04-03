"use client";

import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("AuthGuard: isAuthenticated", isAuthenticated);
    if (!isAuthenticated) {
      console.log("AuthGuard: redirecting to /login");
      router.push("/login");
    } else {
      console.log("AuthGuard: access granted");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}