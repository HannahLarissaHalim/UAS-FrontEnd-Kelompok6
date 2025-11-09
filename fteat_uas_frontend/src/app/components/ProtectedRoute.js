"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // kalau belum login → redirect ke /login
    if (!token) {
      // pakai setTimeout biar gak kena warning setState di dalam effect
      setTimeout(() => {
        router.replace("/login");
      }, 0);
      return;
    }

    // kalau ada token → lanjut tampilkan page
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null; // cegah render sebelum dicek
  return children;
}
