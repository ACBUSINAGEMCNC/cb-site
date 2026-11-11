import Image from "next/image";
import Link from "next/link";
import MobileSiteMenu from "@/components/MobileSiteMenu";
import { SITE, whatsappLink } from "@/lib/site";

const navigation = [
  { href: "/pecas", label: "Catálogo" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Image
            src="/logo-acb.png"
            alt=""
            width={48}
            height={48}
            priority
            sizes="48px"
            className="h-11 w-11 shrink-0 object-contain"
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-bold uppercase leading-none tracking-tight text-fg">
              {SITE.name}
            </span>
            <span className="mt-1 hidden truncate text-[10px] text-muted sm:block">
              {SITE.brandLine}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          <nav aria-label="Navegação principal" className="flex items-center gap-5">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form
            action="/pecas"
            method="get"
            role="search"
            className="flex h-10 items-center border border-line bg-surface"
          >
            <label className="sr-only" htmlFor="site-search">
              Buscar peças
            </label>
            <input
              id="site-search"
              type="search"
              name="q"
              placeholder="Código ou nome"
              className="h-full w-36 bg-transparent px-3 text-xs text-fg outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent xl:w-44"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="grid h-full w-10 place-items-center border-l border-line text-steel transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <circle
                  cx="10.8"
                  cy="10.8"
                  r="6.3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="m15.5 15.5 4.2 4.2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </form>

          <Link
            href={whatsappLink("Olá! Gostaria de solicitar um orçamento.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center bg-accent px-4 text-xs font-bold text-accent-fg transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Orçamento no WhatsApp
          </Link>
        </div>

        <MobileSiteMenu navigation={navigation} />
      </div>
      <div className="hazard-stripe h-1" aria-hidden="true" />
    </header>
  );
}
