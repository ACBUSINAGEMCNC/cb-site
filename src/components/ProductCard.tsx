import Image from "next/image";
import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import GearIcon from "@/components/GearIcon";

export type ProductCardData = {
  slug: string;
  name: string;
  internalCode: string | null;
  category: {
    name: string;
    slug: string;
  };
  images: {
    url: string;
    isPrimary: boolean;
    sortOrder: number;
  }[];
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const primaryImage =
    product.images.find((image) => image.isPrimary) ?? product.images[0];
  const code = product.internalCode ?? product.slug.toUpperCase();
  const quoteLink = whatsappLink(
    `Olá! Quero orçamento da peça ${code} - ${product.name}`
  );

  return (
    <article className="group relative flex h-full flex-col border border-line bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-accent/40">
      <Link
        href={`/pecas/${product.slug}`}
        className="block flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <div className="relative p-3">
          <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_60%,#2a2f36,#14171b_70%)]">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={`${product.name} — ${code}`}
                fill
                sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, (max-width: 1279px) 22vw, 18vw"
                className="object-contain p-6 drop-shadow-2xl transition-transform duration-200 group-hover:scale-[1.025]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-steel/60">
                <GearIcon className="h-12 w-12" />
              </div>
            )}
            <span className="absolute left-2 top-2 z-10 border border-line bg-bg/90 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-steel">
              {code}
            </span>
          </div>
        </div>

        <div className="px-4 pb-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            {product.category.name}
          </p>
          <h3 className="mt-2 line-clamp-2 min-h-11 font-display text-xl font-semibold uppercase leading-tight tracking-tight text-fg">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="px-4 pb-4 pt-3">
        <Link
          href={quoteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-20 inline-flex min-h-10 w-full items-center justify-center border border-line px-3 text-xs font-semibold text-steel transition-colors duration-200 hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Solicitar orçamento
        </Link>
      </div>
    </article>
  );
}
