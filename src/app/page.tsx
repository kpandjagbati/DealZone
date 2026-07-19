import { Suspense } from "react";
import { HomePage } from "@/components/home/HomePage";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base-200" />}>
      <HomePage />
    </Suspense>
  );
}
