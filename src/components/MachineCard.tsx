import Image from "next/image";
import Link from "next/link";

type MachineCardProps = {
  slug: string;
  name: string;
  image: string;
  count: number;
};

export default function MachineCard({
  slug,
  name,
  image,
  count,
}: MachineCardProps) {
  return (
    <Link
      href={`/pecas?categoria=${slug}`}
      className="group block border border-line bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-[radial-gradient(circle_at_50%_60%,#2a2f36,#14171b_70%)]">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
          className="object-contain p-5 drop-shadow-2xl transition-transform duration-200 group-hover:scale-[1.03]"
        />
        <span className="absolute bottom-3 left-3 border border-line bg-bg/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-steel">
          {count} peças
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 pt-4">
        <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-fg">
          {name}
        </h3>
        <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
