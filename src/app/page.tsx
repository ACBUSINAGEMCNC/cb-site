import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Image from "next/image";
import PostsMarquee from "@/components/PostsMarquee";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/hero-tractor-plantando.jpg"
              alt="Trator plantando"
              fill
              className="object-cover opacity-35"
              priority
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.12),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />
          </div>
          <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  Peças agrícolas paralelas | Alta performance
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                  Peças agrícolas para quem não pode parar.
                </h1>
                <p className="mt-4 text-base leading-7 text-white/75">
                  Catálogo de peças de reposição para linha agrícola, com suporte direto no
                  WhatsApp e capacidade industrial completa (usinagem CNC, modelos para
                  fundição e engenharia reversa).
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/pecas"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-yellow-400 px-5 text-sm font-semibold text-black hover:bg-yellow-300"
                  >
                    Ver catálogo
                  </a>
                  <a
                    href="https://wa.me/5545999434981?text=Ol%C3%A1%2C%20entrei%20no%20site%20da%20CB%20Usinage%20e%20gostaria%20de%20um%20or%C3%A7amento."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Falar no WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="grid gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative col-span-2 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                      <Image
                        src="/hero-colheitadeira.png"
                        alt="Colheitadeira"
                        fill
                        className="object-cover opacity-90"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-xs font-semibold text-white/90">
                        Colheitadeira
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                      <Image
                        src="/hero-pulverizador-jd.png"
                        alt="Pulverizador"
                        fill
                        className="object-cover opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-xs font-semibold text-white/90">
                        Pulverizador
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <div className="relative aspect-[16/7]">
                      <Image
                        src="/hero-colheitadeira-case-v2.png"
                        alt="Máquina agrícola"
                        fill
                        className="object-cover opacity-90"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />
                      <div className="absolute left-4 top-4">
                        <div className="text-sm font-semibold text-yellow-300">
                          Linha Agrícola
                        </div>
                        <div className="mt-1 text-xs text-white/80">
                          Reposição com performance e durabilidade.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <a
                      href="/pecas"
                      className="rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-white/10"
                    >
                      <div className="text-sm font-semibold text-yellow-300">Destaques</div>
                      <div className="mt-2 text-sm text-white/75">
                        Ponteiras, eixos, buchas e itens de reposição.
                      </div>
                    </a>
                    <a
                      href="/servicos"
                      className="rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-white/10"
                    >
                      <div className="text-sm font-semibold text-green-300">Serviços</div>
                      <div className="mt-2 text-sm text-white/75">
                        Scanner 3D, engenharia reversa e usinagem CNC.
                      </div>
                    </a>
                    <a
                      href="/sobre"
                      className="rounded-2xl border border-white/10 bg-black/30 p-5 hover:bg-white/10"
                    >
                      <div className="text-sm font-semibold text-white">Sobre</div>
                      <div className="mt-2 text-sm text-white/75">
                        Artcompany e ACB Usinagem CNC Ltda.
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PostsMarquee />

        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/pecas?categoria=linha-fundida"
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
            >
              <div className="text-lg font-semibold">Linha Fundida</div>
              <div className="mt-2 text-sm text-white/70">
                Componentes fundidos com foco em resistência, acabamento e confiabilidade.
                Matéria-prima selecionada e controle de qualidade.
              </div>
            </a>
            <a
              href="/pecas?categoria=linha-de-eixos"
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
            >
              <div className="text-lg font-semibold">Linha de Eixos</div>
              <div className="mt-2 text-sm text-white/70">
                Precisão dimensional e repetibilidade em usinagem.
                Alta durabilidade para plantadeiras e aplicações agrícolas.
              </div>
            </a>
            <a
              href="/pecas?categoria=linha-de-buchas"
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
            >
              <div className="text-lg font-semibold">Linha de Buchas</div>
              <div className="mt-2 text-sm text-white/70">
                Buchas temperadas e retificadas com excelente acabamento.
                Qualidade e desempenho para reduzir desgaste e paradas.
              </div>
            </a>

            <a
              href="/servicos"
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
            >
              <div className="text-lg font-semibold">Inovação & Melhorias</div>
              <div className="mt-2 text-sm text-white/70">
                Evolução contínua em tecnologia, processos e controle de qualidade.
                Engenharia reversa, medição e usinagem com precisão.
              </div>
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
