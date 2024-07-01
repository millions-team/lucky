import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

import { type Bounty, fromBN, toBN } from '@luckyland/anchor';

import {
  type TokenAccount,
  useTollkeeperTraders,
  useTreasureGems,
} from '@/hooks';

type BountyFormProps = {
  task: PublicKey;
  settings?: Bounty;
  className?: string;
  onSubmit: (bounty: Bounty) => Promise<void>;
  onCancel: () => void;
};

type BountySettings = {
  gem: TokenAccount;
  reward: number;
  trader: TokenAccount;
  price: number;
};

function SelectToken({
  tokens,
  token,
  setToken,
}: {
  tokens: Array<TokenAccount>;
  token: TokenAccount;
  setToken: (token: TokenAccount) => void;
}) {
  const tokensMap = Object.fromEntries(tokens.map((t) => [t.mint, t]));
  return (
    <select
      className="select select-bordered"
      value={token?.mint.toString() || '_label'}
      onChange={(e) => {
        if (e.target.value === '_label') return;
        const selected = tokensMap[e.target.value];
        if (selected) setToken(selected);
      }}
    >
      <option disabled value="_label">
        Select
      </option>
      {tokens.map(({ name, symbol, amount, address, mint }) => (
        <option key={address} value={mint.toString()}>
          {name} | {amount} ${symbol}
        </option>
      ))}
    </select>
  );
}

function InputAmount({
  token,
  value,
  setValue,
  placeholder = 'Enter amount',
}: {
  token?: TokenAccount;
  value: number;
  setValue: (value: number) => void;
  placeholder?: string;
}) {
  return (
    <label className="input input-bordered flex items-center gap-2">
      ${token?.symbol}
      <input
        type="number"
        disabled={!token?.mint}
        className="grow"
        placeholder={placeholder}
        value={isNaN(value) ? '' : value}
        onChange={(e) => setValue(Math.max(Number(e.target.value), 0))}
      />
    </label>
  );
}

export function BountyForm({
  task,
  settings: _init,
  className,
  onSubmit,
  onCancel,
}: BountyFormProps) {
  const { gems, getGem } = useTreasureGems({});
  const { traders, getTrader } = useTollkeeperTraders({});

  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState({} as BountySettings);

  useEffect(() => {
    if (!_init || (settings.gem && settings.trader)) return;
    const gem = getGem(_init.gem);
    const trader = getTrader(_init.trader);

    setSettings({
      gem: gem || gems[0],
      reward: fromBN(_init.reward, gem?.decimals || 0),
      trader: trader || traders[0],
      price: fromBN(_init.price, trader?.decimals || 0),
    });
  }, [_init, getGem, getTrader, gems, traders]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const bounty: Bounty = {
        task,
        gem: settings.gem.mint,
        reward: toBN(settings.reward, settings.gem.decimals),
        trader: settings.trader.mint,
        price: toBN(settings.price, settings.trader.decimals),
      };

      await onSubmit(bounty);
      reset(true);
    } catch (e) {
      console.log(e);
      reset();
    }
  };

  const reset = (success?: boolean) => {
    setSubmitting(false);
    if (success) setSettings({} as BountySettings);
  };
  return (
    <div className={`card w-full max-w-md glass ${className}`}>
      <div className="card-body">
        <div className="card-title flex-col justify-center">
          <h2 className="text-3xl">
            {_init ? 'Manage Bounty' : 'Issue Bounty'}
          </h2>
          <h4 className="text-sm text-info">
            {_init ? 'Manage the bounty' : 'Issue a new bounty'}
            &nbsp;for this game mode
          </h4>
        </div>

        <form onSubmit={submit}>
          <div className="form-control border-t-2 mt-4 items-center">
            <label className="label">
              <span className="label-text text-xl">Reward</span>
            </label>

            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Gem</span>
              </label>
              <SelectToken
                tokens={gems}
                token={settings.gem}
                setToken={(gem) => setSettings((s) => ({ ...s, gem }))}
              />
            </div>

            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Reward</span>
              </label>

              <InputAmount
                token={settings.gem}
                value={settings.reward}
                setValue={(reward) => setSettings((s) => ({ ...s, reward }))}
              />

              <label className="label">
                <span className="label-text">Decimals</span>
                <span className="label-text-alt">{settings.gem?.decimals}</span>
              </label>
            </div>
          </div>

          <div className="form-control border-t-2 mt-4 items-center">
            <label className="label">
              <span className="label-text text-xl">Price</span>
            </label>

            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Trader</span>
              </label>
              <SelectToken
                tokens={traders}
                token={settings.trader}
                setToken={(trader) => setSettings((s) => ({ ...s, trader }))}
              />
            </div>

            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Price</span>
              </label>

              <InputAmount
                token={settings.trader}
                value={settings.price}
                setValue={(price) => setSettings((s) => ({ ...s, price }))}
              />

              <label className="label">
                <span className="label-text">Decimals</span>
                <span className="label-text-alt">
                  {settings.trader?.decimals}
                </span>
              </label>
            </div>
          </div>

          <div className="card-actions justify-around mt-8">
            <button
              className={`btn btn-ghost ${submitting ? 'hidden' : ''}`}
              onClick={() => {
                reset();
                onCancel();
              }}
            >
              Cancel
            </button>
            <button
              className={`btn ${
                submitting ? 'btn-wide btn-info btn-outline' : 'btn-primary'
              }`}
            >
              {submitting ? (
                <span className="loading loading-infinity loading-lg"></span>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
