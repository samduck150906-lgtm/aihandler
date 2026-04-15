"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/index";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-surface-muted dark:bg-zinc-900/50 border-t-[3px] border-ink dark:border-zinc-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex gap-6 font-bold text-sm flex-wrap">
          <Link href="/terms" className="text-ink dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="text-ink dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {t("footer.privacy")}
          </Link>
          <Link href="/refund" className="text-ink dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {t("footer.refund")}
          </Link>
        </div>

        <div className="text-xs text-ink-secondary dark:text-zinc-400">
          {t("footer.copyright", { year })}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
