export interface Coin {
  valueCents: number;
  label: string;
}

// the only coins the machine takes - buttons in the UI match this list 1:1
export const ACCEPTED_COINS: Coin[] = [
  { valueCents: 10, label: '10c' },
  { valueCents: 20, label: '20c' },
  { valueCents: 50, label: '50c' },
  { valueCents: 100, label: '€1' },
  { valueCents: 200, label: '€2' },
];

export const ACCEPTED_COIN_VALUES: readonly number[] = ACCEPTED_COINS.map((c) => c.valueCents);
