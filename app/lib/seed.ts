export function hash(text: string) {
    let value = 0x811c9dc5
    for (let index = 0; index < text.length; index++) {
        value ^= text.charCodeAt(index)
        value = Math.imul(value, 0x01000193)
    }
    return value >>> 0
}

export const seededFraction = (seed: string) => hash(seed) / 2 ** 32

export function seededShuffle<T>(items: T[], seed: string) {
    return items
        .map((item, index) => ({ item, order: seededFraction(`${seed}:${index}`) }))
        .sort((a, b) => a.order - b.order)
        .map(({ item }) => item)
}
