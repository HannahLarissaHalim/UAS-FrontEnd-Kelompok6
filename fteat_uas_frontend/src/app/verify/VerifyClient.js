"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        console.log("Verifying token:", token);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${token}`
        );
        const data = await res.json();

        if (data.success) {
          // Redirect to login page after successful verification
          // User needs to login with their credentials
          router.push("/login");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        router.push("/login");
      }
    };

    if (token) verifyAndRedirect();
    else router.push("/login");
  }, [token]);

  return null; // no UI
}
