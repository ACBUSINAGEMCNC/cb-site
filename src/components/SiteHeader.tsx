import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-acb.png"
            alt="ACB Usinagem CNC"
            width={40}
            height={40}
            className="rounded-md"
            priority
          />
          <div className="flex flex-col leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              ACB Usinagem CNC Ltda.
            </div>
            <div className="text-[11px] text-white/70">
              Artcompany | Indústria de Peças Agrícolas
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-white/80">
          <Link className="hover:text-yellow-300" href="/pecas">
            Peças
          </Link>
          <Link className="hover:text-yellow-300" href="/servicos">
            Serviços
          </Link>
          <Link className="hover:text-yellow-300" href="/sobre">
            Sobre
          </Link>
          <Link className="hover:text-yellow-300" href="/admin">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
