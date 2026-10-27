import { normalizeIndianMobile } from '@/lib/identity/phone'

/** The wa.me link: straight to a chat when we know the number, else WhatsApp's own picker. */
export function whatsappUrl(text: string, phone?: string | null): string {
  const normalized = normalizeIndianMobile(phone)
  return `https://wa.me/${normalized ?? ''}?text=${encodeURIComponent(text)}`
}
