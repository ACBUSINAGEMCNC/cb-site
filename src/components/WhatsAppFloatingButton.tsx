import Link from "next/link";

const WHATSAPP_NUMBER = "5545999434981";

export default function WhatsAppFloatingButton({
  message = "Olá, entrei no site da ACB Usinagem CNC Ltda. e gostaria de um orçamento.",
}: {
  message?: string;
}) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/30 transition hover:bg-green-500"
      aria-label="Falar no WhatsApp"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
      WhatsApp
    </Link>
  );
}
