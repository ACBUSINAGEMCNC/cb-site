import Image from "next/image";
import Link from "next/link";
import AddToQuoteButton from "@/components/AddToQuoteButton";
import GearIcon from "@/components/GearIcon";

export type ProductCardData = {
  id: number;
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
          </div>
        </div>

        <div className="px-4 pb-1">
          <span className="inline-block border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
            {product.category.name}
          </span>
          <h3 className="mt-3 font-mono text-lg font-bold leading-none tracking-tight text-accent sm:text-xl">
            {code}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-10 font-display text-base font-semibold uppercase leading-snug text-fg">
            {product.name}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4 pt-3">
        <AddToQuoteButton
          product={{
            productId: product.id,
            slug: product.slug,
            code,
            name: product.name,
            image: primaryImage?.url ?? null,
            machine: product.category.name,
          }}
        />
      </div>
    </article>
  );
}
