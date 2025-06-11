import { Suspense } from "react";
import dynamic from "next/dynamic";

const VerifyComponent = dynamic(() => import("./VerifyComponent"), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Verifying...</div>}>
      <VerifyComponent />
    </Suspense>
  );
}
