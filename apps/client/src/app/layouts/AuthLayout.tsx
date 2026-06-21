import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "../../components/ui/Logo";
import { AuthDynamicCanvas } from "../../features/auth/components/AuthDynamicCanvas";

export function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-[100dvh] relative flex flex-col items-center bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      {/* Dynamic Bento Canvas Background */}
      <AuthDynamicCanvas />

      {/* Centered Glass Card */}
      <div
        className="relative z-10 w-full max-w-[440px] my-auto rounded-[2rem] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-zinc-200/50 dark:border-white/10 p-6 sm:p-10 shadow-2xl transition-[height] duration-300"
      >
        <div className="flex justify-center mb-8">
          <BrandLogo textClassName="text-xl dark:text-white" iconClassName="bg-zinc-100 dark:bg-white/10 dark:border dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
        </div>
        
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
