"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ModeCardProps {
  title: string;
  subtitle?: string;
  accentClassName?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function ModeCard({ title, subtitle, accentClassName, icon, children }: ModeCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {icon ? (
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accentClassName || "bg-gray-50"}`}>
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-gray-900">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {children ? <div className="mt-5 sm:mt-6">{children}</div> : null}
      </div>
    </motion.section>
  );
}


