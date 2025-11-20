import { Suspense } from "react";
import CheckEmailClient from "./CheckEmailClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckEmailClient />
    </Suspense>
  );
}
