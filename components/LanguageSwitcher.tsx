"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
  const locale = useLocale(); // e.g., "en" or "am"
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (nextLocale: string) => {
    // Replace the active locale prefix in the URL pathway
    // e.g. "/en/dashboard" -> "/am/dashboard"
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const newPath = segments.join("/");

    startTransition(() => {
      router.push(newPath);
    });
  };

  return (
    <div className="relative inline-block">
      <select
        defaultValue={locale}
        disabled={isPending}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-lg py-1.5 pl-3 pr-8 text-xs font-semibold cursor-pointer focus:outline-none focus:border-amber-500 transition duration-150 disabled:opacity-50"
      >
        <option value="en">🇺🇸 English</option>
        <option value="am">🇪🇹 አማርኛ</option>
      </select>
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
        <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}