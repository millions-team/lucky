import { GAME_NAME_LEN } from './constants';

export function encodeName(name: string) {
  const buffer = new TextEncoder().encode(name);
  const MAX_LEN = GAME_NAME_LEN - 1;
  return Array.from({ length: GAME_NAME_LEN }, (_, i) =>
    i === MAX_LEN ? 0 : buffer[i] ?? 0
  );
}

export function decodeName(name: number[]) {
  return new TextDecoder().decode(Uint8Array.from(name));
}
