export function formatter(pieces: bigint, symbol: string) {
  return function formatAmount(amount: bigint, raw = true) {
    const _amount = raw ? amount / pieces : amount;
    return `${Intl.NumberFormat().format(_amount)} $${symbol}`;
  };
}
