export function converter(text: string, table: Record<string, string>): string {
  return text
    .split('')
    .map((_: string) => {
      return table[_] || _
    })
    .join('')
}
