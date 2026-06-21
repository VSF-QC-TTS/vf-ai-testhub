import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function SuspenseFallback() {
  return (
    <div className="flex flex-col gap-4 w-full p-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      {children}
    </Suspense>
  );
}
