"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // kalau belum login → redirect ke /login
    if (!token) {
      // pakai setTimeout biar gak kena warning setState di dalam effect
      setTimeout(() => {
        router.replace("/choose-login");
      }, 0);
      return;
    }

    if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) { 
      // user mencoba akses bukan haknya
      setTimeout(() => {
        if (role === "vendor") router.replace("/vendor/welcome");
        else if (role === "admin") router.replace("/admin-dashboard");
        else router.replace("/home"); // default mahasiswa
      }, 0);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) return null; // cegah render sebelum dicek

  return children;
}
