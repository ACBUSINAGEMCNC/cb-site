import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function SobrePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Sobre</h1>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Artcompany</h2>
          <p className="mt-3 text-sm leading-7 text-white/75">
            Fundada em 2013 e situada estrategicamente na cidade de Cascavel, no estado do
            Paraná. A indústria tem como expertise a produção de peças agrícolas de excelente
            qualidade e alta performance.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/75">
            Seus fundadores, Celso José de Moura e Adriana Silva dos Santos, observaram uma
            carência no mercado agrícola: produzir peças de alta qualidade e durabilidade.
            Com essa visão, nascia a Artcompany.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/75">
            A indústria cresceu investindo em tecnologia e mão de obra especializada, hoje
            atendendo todo o território nacional e mirando também o mercado internacional.
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">ACB Usinagem CNC Ltda.</h2>
          <p className="mt-3 text-sm leading-7 text-white/75">
            Estrutura focada em usinagem CNC, desenvolvimento e suporte industrial, atuando
            em conjunto com a Artcompany para entregar precisão, repetibilidade e alta
            performance para o agronegócio.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">O que a gente entrega</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-yellow-300">Qualidade</div>
              <div className="mt-2 text-sm text-white/75">
                Peças agrícolas paralelas com excelente desempenho e durabilidade.
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-green-300">Tecnologia</div>
              <div className="mt-2 text-sm text-white/75">
                CNC, metrologia, scanner 3D e engenharia reversa para máxima precisão.
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold">Atendimento</div>
              <div className="mt-2 text-sm text-white/75">
                Atendimento direto via WhatsApp e envio para todo o Brasil.
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
