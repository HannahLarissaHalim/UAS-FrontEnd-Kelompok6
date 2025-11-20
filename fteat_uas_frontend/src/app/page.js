// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function Page() {
//   const router = useRouter();

//   useEffect(() => {
//     router.replace("/home"); // langsung redirect ke /home
//   }, [router]);

//   return null; // gak tampil apa-apa di root
// }

import { redirect } from "next/navigation";

export default function Page() {
  redirect("/home");
}
