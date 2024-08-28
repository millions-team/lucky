export type PresaleSettings = {
  start: number;
  end: number;
  min: number;
  max: number;
  prices: number[];
  amounts: number[];
};

export const PRESALE = {
  start: 1724558400000,
  end: 1724644800000,
  min: 10_000,
  max: 10_000_000,
  prices: [0.0000003, 0.0000004, 0.0000005, 0.0000006, 0.000001],
  amounts: [60_000_000, 50_000_000, 35_000_000, 20_000_000, 10_000_000],
} as PresaleSettings;
