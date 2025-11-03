"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        console.log("Verifying token:", token);
        
        // Verify user by token
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${token}`);
        const data = await res.json();

        if (data.success) {
          // Store user info & token
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("npm", data.data.npm);
          localStorage.setItem("name", data.data.name);
          localStorage.setItem("role", data.data.role);

          // Redirect to dashboard after verification
          router.push("/dashboard/customer");
        } else {
          // Invalid token -> go back to login
          router.push("/login");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        router.push("/login");
      }
    };

    // Only run if token exists
    if (token) verifyAndRedirect();
    else router.push("/login");
  }, [token]);

  return null; // No UI, invisible redirect page
}
