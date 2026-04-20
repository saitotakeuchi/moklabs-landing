/**
 * WhatsApp CTA helpers. Centralizes the number and the prefilled-message
 * URL convention so every placement emits consistent, trackable links.
 *
 * Note: wa.me strips query params before the chat opens, so UTM passthrough
 * must be done by appending the attribution hint to the message body itself.
 * That concatenation happens in components/common/WhatsAppLink.tsx at click
 * time — this module only owns the URL shape.
 */

export const WHATSAPP_NUMBER = "5541936182622";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_MESSAGES = {
  heroHome:
    "Olá! Vim do site da Mok Labs e quero saber mais sobre soluções digitais para educação.",
  bannerHome: "Olá! Pronto para tirar minha ideia do papel. Podemos conversar?",
  heroPnld:
    "Olá! Vim do site da Mok Labs e quero adaptar um livro para o PNLD. Podemos conversar?",
  bannerPnld: "Olá! Pronto para começar meu projeto PNLD. Podemos conversar?",
  footerPhone: "Olá! Vim do site da Mok Labs.",
} as const;

export type WhatsAppPlacement = keyof typeof WHATSAPP_MESSAGES;
