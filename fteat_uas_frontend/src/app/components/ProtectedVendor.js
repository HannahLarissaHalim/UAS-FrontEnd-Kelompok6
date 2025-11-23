// src/app/components/ProtectedVendor.js
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedVendor({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      setTimeout(() => router.replace('/vendor/login'), 0);
      return;
    }

    try {
      const u = JSON.parse(user);
      if (u.role !== 'vendor') {
        setTimeout(() => router.replace('/vendor/login'), 0);
        return;
      }

      // if vendor object has isApproved or status, check it
      if (u.isApproved === false || u.isApproved === "false" || u.status === 'pending') {
        // redirect to pending page
        setTimeout(() => router.replace('/vendor/pending'), 0);
        return;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true);
    } catch (e) {
      setTimeout(() => router.replace('/vendor/login'), 0);
    }
  }, [router]);

  if (!authorized) return null;
  return children;
}
