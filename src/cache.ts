export type Words = Map<string, string>

export const st: Words = new Map()
export const ts: Words = new Map()

export type PhrasesMap = Map<string, [string[], string[]]>

export const simplifiedPhrasesMap: PhrasesMap = new Map()
export const traditionalPhrasesMap: PhrasesMap = new Map()
