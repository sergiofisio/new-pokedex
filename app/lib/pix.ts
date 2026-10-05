const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`

const sanitize = (text: string, maxLength: number) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().slice(0, maxLength)

function crc16(payload: string) {
    let crc = 0xffff
    for (let index = 0; index < payload.length; index++) {
        crc ^= payload.charCodeAt(index) << 8
        for (let bit = 0; bit < 8; bit++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
            crc &= 0xffff
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0')
}

interface PixOptions {
    key: string;
    name: string;
    city: string;
    amount?: number;
    description?: string;
}

export function buildPixPayload({ key, name, city, amount, description }: PixOptions) {
    const account = field('00', 'br.gov.bcb.pix') + field('01', key) + (description ? field('02', description.slice(0, 40)) : '')
    const payload = [
        field('00', '01'),
        field('26', account),
        field('52', '0000'),
        field('53', '986'),
        amount ? field('54', amount.toFixed(2)) : '',
        field('58', 'BR'),
        field('59', sanitize(name, 25)),
        field('60', sanitize(city, 15)),
        field('62', field('05', '***')),
        '6304',
    ].join('')
    return payload + crc16(payload)
}

export const PIX_CONFIG = {
    key: process.env.NEXT_PUBLIC_PIX_KEY ?? '',
    name: process.env.NEXT_PUBLIC_PIX_NAME ?? '',
    city: process.env.NEXT_PUBLIC_PIX_CITY ?? '',
}

export const KOFI_URL = process.env.NEXT_PUBLIC_KOFI_URL ?? ''
