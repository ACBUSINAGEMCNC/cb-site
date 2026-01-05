"use client";

import Image from "next/image";

type PostItem = {
  src: string;
  label: string;
};

const ITEMS: PostItem[] = [
  { src: "/posts/colheitadeira-1.png", label: "Colheitadeira" },
  { src: "/posts/colheitadeira-2.png", label: "Colheitadeira" },
  { src: "/posts/case-1.png", label: "Case" },
  { src: "/posts/case-2.png", label: "Case" },
  { src: "/posts/pulverizador-1.png", label: "Pulverizador" },
  { src: "/posts/pulverizador-2.png", label: "Pulverizador" },
];

export default function PostsMarquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-yellow-300">Atualizações</div>
          <div className="mt-1 text-sm text-white/70">
            Novidades, máquinas e bastidores (estilo stories).
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div
          className="flex gap-3 p-3 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
          style={{
            animation: "cb-marquee 28s linear infinite",
            width: "max-content",
          }}
        >
          {doubled.map((item, idx) => (
            <div
              key={`${item.src}-${idx}`}
              className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30"
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <div className="text-[10px] font-semibold text-white/90">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes cb-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
