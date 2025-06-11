'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";

const VerifyComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (!userId || !secret) {
      setMessage("Missing verification parameters.");
      return;
    }

    const verify = async () => {
      try {
        await account.updateVerification(userId, secret);
        setMessage("Your email has been successfully verified!");
        setTimeout(() => router.push("/log-in"), 3000);
      } catch (error: unknown) {
        console.error(error);
        setMessage("Verification failed. The link may have expired or is invalid.");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <div className="text-center px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default VerifyComponent;
