export const SITE = {
  name: "ACB Usinagem CNC",
  legalName: "ACB Usinagem CNC Ltda.",
  brandLine: "Artcompany | Indústria de Peças Agrícolas",
  city: "Cascavel - PR",
  whatsappNumber: "5545999554335",
  whatsappDisplay: "(45) 99955-4335",
  instagram: null,
};

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
