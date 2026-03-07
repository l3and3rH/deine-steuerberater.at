import Link from "next/link";

export default function ClaimProfileCTA({ profileName, className }: { profileName: string; className?: string }) {
  return (
    <div className={`bg-gold-500/10 border border-gold-500/20 rounded-xl p-5 ${className ?? "mt-8"}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-forest-900 text-sm mb-1">Ist das Ihre Kanzlei?</p>
          <p className="text-sm text-forest-600 mb-3">
            Beanspruchen Sie das Profil von {profileName} und verwalten Sie Ihre Informationen selbst.
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-600 transition-colors">
            Profil beanspruchen
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
