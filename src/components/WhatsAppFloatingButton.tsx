import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";

export default function WhatsAppFloatingButton({
  message = "Olá, entrei no site da ACB Usinagem CNC Ltda. e gostaria de um orçamento.",
}: {
  message?: string;
}) {
  return (
    <Link
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-green px-4 text-sm font-semibold text-white shadow-lg shadow-black/40 transition duration-200 hover:-translate-y-0.5 hover:bg-green/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:w-auto"
      aria-label={`Falar com a ACB pelo WhatsApp: ${SITE.whatsappDisplay}`}
    >
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6 shrink-0">
        <path d="M16 3a12.8 12.8 0 0 0-10.9 19.5L3.5 29l6.7-1.6A12.8 12.8 0 1 0 16 3Zm0 23.3a10.5 10.5 0 0 1-5.3-1.4l-.4-.2-4 .9 1-3.9-.3-.4a10.5 10.5 0 1 1 9 5Zm5.8-7.9c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.1-.3.2-.6.1a8.5 8.5 0 0 1-2.5-1.5 9.3 9.3 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.5c.1-.2 0-.4 0-.6l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.4 2.4 3.7 5.8 5.1c.8.3 1.4.5 1.8.6.8.2 1.5.2 2.1.1.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4s-.2-.2-.5-.4Z" />
      </svg>
      <span className="hidden md:inline">WhatsApp</span>
    </Link>
  );
}
