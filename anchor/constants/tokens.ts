export const TOKENS = Object.fromEntries(
  [
    {
      name: 'LuckyLand',
      symbol: 'L',
      decimals: 9,
      image: 'gem.svg',
    },
    {
      name: 'Lucky Shot',
      symbol: 'LS',
      decimals: 4,
      image: 'trader.svg',
    },
  ].map((token) => [
    token.symbol,
    { ...token, PIECES_PER_TOKEN: BigInt(10 ** token.decimals) },
  ])
);

export function getTokenDefinition(symbol: string) {
  if (symbol in TOKENS) return TOKENS[symbol];
  throw new Error(`Token not found: ${symbol}`);
}
