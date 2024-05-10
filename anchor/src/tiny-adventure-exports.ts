// Here we export some useful types and functions for interacting with the Anchor program.
import { PublicKey } from '@solana/web3.js';
import type { TinyAdventure } from '../target/types/tiny_adventure';
import { IDL as TinyAdventureIDL } from '../target/types/tiny_adventure';

// Re-export the generated IDL and type
export { TinyAdventure, TinyAdventureIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const TINY_ADVENTURE_PROGRAM_ID = new PublicKey(
  '3hjhpnRWrcTYpmcygPjKnJRnJ3udVSzXYaChbrhgBWqC'
);
