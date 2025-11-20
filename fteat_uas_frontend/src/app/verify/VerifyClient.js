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
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("npm", data.data.npm);
          localStorage.setItem("name", data.data.name);
          localStorage.setItem("role", data.data.role);

          router.push("/dashboard/customer");
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
