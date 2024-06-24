export function encodeName(name: string) {
  const buffer = new TextEncoder().encode(name);
  return Array.from({ length: 33 }, (_, i) => (i === 32 ? 0 : buffer[i] ?? 0));
}

export function decodeName(name: number[]) {
  return new TextDecoder().decode(Uint8Array.from(name));
}
