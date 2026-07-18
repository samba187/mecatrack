import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-4 text-center">
      <Logo />
      <div>
        <h1 className="text-2xl font-bold">Page introuvable</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Ce lien n&apos;existe pas ou n&apos;est plus valide. S&apos;il
          s&apos;agit d&apos;un lien de suivi, vérifiez le SMS reçu ou
          contactez votre garage.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-primary-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
