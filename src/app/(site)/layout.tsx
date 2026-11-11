import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { QuoteCartProvider } from "@/components/cart/CartProvider";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <QuoteCartProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
      <WhatsAppFloatingButton />
    </QuoteCartProvider>
  );
}
