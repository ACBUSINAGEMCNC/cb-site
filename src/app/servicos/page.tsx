import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Image from "next/image";

export default function ServicosPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Serviços</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">
          Artcompany e ACB Usinagem CNC Ltda. contam com tecnologia CNC e instrumentos de
          medição, com colaboradores qualificados para atender com rapidez, qualidade e
          precisão.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="relative aspect-[16/9]">
              <Image
                src="/service-3d-scanner-v2.jpg"
                alt="Scanner 3D"
                fill
                className="object-cover opacity-90"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h2 className="text-lg font-semibold">Scanner 3D e Engenharia Reversa</h2>
                <p className="mt-1 text-sm text-white/75">
                  Para máxima precisão na modelagem 3D.
                </p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/75">
                Desenvolvemos novos itens e soluções sob medida, com base em escaneamento 3D
                e engenharia reversa.
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="relative aspect-[16/9]">
              <Image
                src="/service-cnc-industrial-v2.jpg"
                alt="Centro de usinagem"
                fill
                className="object-cover opacity-90"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h2 className="text-lg font-semibold">Modelos para Fundição</h2>
                <p className="mt-1 text-sm text-white/75">Projetos conforme sua necessidade.</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/75">
                Modelos para fundição em diversos sistemas de moldagem (ex.: Squeezer,
                Coldbox, Pep Set, entre outros). Projeto feito com escaneamento 3D e
                engenharia reversa.
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="relative aspect-[16/9]">
              <Image
                src="/service-cnc-lathe.jpg"
                alt="Tornos CNC"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h2 className="text-lg font-semibold">Usinagem de Peças Seriadas (Tornos CNC)</h2>
                <p className="mt-1 text-sm text-white/75">
                  Usinagem de variadas peças em máquinas de alta precisão.
                </p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/75">
                Processo voltado para repetibilidade, acabamento e produtividade em série.
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="relative aspect-[16/9]">
              <Image
                src="/service-machining-center.jpg"
                alt="Centros de usinagem"
                fill
                className="object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h2 className="text-lg font-semibold">Centros de Usinagem (Matrizes e Moldes)</h2>
                <p className="mt-1 text-sm text-white/75">
                  Usinagem para ferramentaria em geral, com excelência no acabamento.
                </p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-white/75">
                Ideal para matrizes, moldes e peças técnicas com alta exigência dimensional.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-6">
          <div className="text-sm font-semibold text-yellow-300">
            Desenvolvimento de novos itens
          </div>
          <div className="mt-2 text-sm text-white/75">
            Trabalhamos com desenvolvimento de novos itens para atender a sua necessidade.
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
