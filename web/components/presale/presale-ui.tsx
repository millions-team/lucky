'use client';

import { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowLeft,
  IconPencil,
  IconRefresh,
} from '@tabler/icons-react';
import { ProgressBar } from 'react-progressbar-fancy';

import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';

import {
  PresaleSettings,
  usePresaleProgram,
  usePresaleProgramAccount,
} from './presale-data-access';
import { type TokenAccount, useOwnedTokens } from '@/hooks';
import { fromBN } from '@luckyland/anchor';

const formatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

type StageDetails = {
  id: number;
  price: number;
  amount: number;
};
function PresaleSummary({
  settings,
  back,
  create,
  creating,
}: {
  settings: PresaleSettings;
  back: () => void;
  create: () => void;
  creating: boolean;
}) {
  const after = useMemo(() => {
    const total = settings.amounts.reduce((acc, amount) => acc + amount, 0);
    return settings.token.amount - total;
  }, [settings]);

  return (
    <div className="card w-full max-w-md glass mx-auto">
      <div className="card-body space-y-6">
        <h2 className="card-title justify-center text-3xl">Presale Summary</h2>
        <button
          className="btn btn-circle btn-outline absolute top-0 left-2"
          onClick={back}
        >
          <IconArrowLeft />
        </button>
        <div>
          <div className="flex flex-col">
            <span className="label-text">Token</span>
            <ExplorerLink
              path={`address/${settings.token.mint}`}
              label={`${settings.token.name} (${settings.token.symbol})`}
            />
          </div>
          <section className="flex justify-between gap-4">
            <div className="flex flex-col">
              <span className="label-text">Start</span>
              <span>
                {new Date(
                  settings.start ? settings.start * 1000 : Date.now()
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="label-text">End</span>
              <span>
                {settings.end
                  ? new Date(settings.end * 1000).toLocaleString()
                  : 'Until sold out'}
              </span>
            </div>
          </section>
          <div className="divider" />
          <div className="flex justify-between">
            <section className="flex flex-col gap-2">
              <div className="badge gap-1">
                <span className="label-text">Min:</span>
                <span>{formatter.format(settings.min)}</span>
              </div>
              <div className="badge gap-1">
                <span className="label-text">Max:</span>
                <span>
                  {settings.max ? formatter.format(settings.max) : 'None'}
                </span>
              </div>
            </section>
            <div className="divider divider-horizontal" />
            <section className="flex flex-col gap-2 justify-end items-end">
              <div className="badge badge-primary gap-1">
                <span>Tokens for sale:</span>
                <span>
                  {formatter.format(
                    settings.amounts.reduce((acc, amount) => acc + amount, 0)
                  )}{' '}
                  {settings.token.symbol}
                </span>
              </div>

              <div className="badge badge-primary gap-1">
                <span>SOL to collect:</span>
                <span>
                  {formatter.format(
                    settings.prices.reduce(
                      (acc, price, i) => acc + price * settings.amounts[i],
                      0
                    )
                  )}{' '}
                  sol
                </span>
              </div>
            </section>
          </div>
          <div className="divider" />
          <section>
            <ul className="flex flex-wrap gap-4 mt-2 justify-around">
              {settings.prices.map((price, index) => (
                <li key={index} className="card card-compact bg-base-100">
                  <div className="card-body items-center">
                    <h3 className="card-title">Stage {index + 1}</h3>
                    <span className="badge badge-info">
                      {formatter.format(settings.amounts[index])} x {price}
                    </span>
                    <span className="badge badge-secondary">
                      {formatter.format(settings.amounts[index] * price)} sol
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
        {after > 0 ? (
          <div role="alert" className="alert shadow-lg">
            <IconAlertCircle className="text-info" />
            <div>
              <h3 className="font-bold">Confirm the details above!</h3>
              <div className="text-xs">
                Token balance after the sale
                <span className="badge badge-primary badge-sm block">
                  {formatter.format(after)} {settings.token.symbol}
                </span>
              </div>
            </div>
            <button className="btn btn-sm btn-accent" onClick={create}>
              {creating ? <span className="loading loading-ring" /> : 'Create'}
            </button>
          </div>
        ) : (
          <div role="alert" className="alert alert-warning">
            <IconAlertTriangle />
            <span>
              You have not enough tokens in the account to fill the presale
              vault.
            </span>
            <div className="badge gap-1 badge-error">
              <span>Missing:</span>
              <span>{formatter.format(-after)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePresaleForm({
  tokens,
  cancel,
  refresh,
  settings,
  setSettings,
}: {
  tokens: TokenAccount[];
  cancel: () => void;
  refresh: () => void;
  settings?: PresaleSettings;
  setSettings: (settings: PresaleSettings) => void;
}) {
  const [token, setToken] = useState<TokenAccount | undefined>(settings?.token);

  const [stages, setStages] = useState<Array<StageDetails>>(
    settings?.amounts.map((amount, i) => ({
      id: i,
      price: settings.prices[i],
      amount,
    })) || []
  );
  const [stage, setStage] = useState<Partial<StageDetails> | undefined>(
    undefined
  );

  return (
    <div className="card w-full max-w-md glass mx-auto">
      <form
        className="card-body space-y-6"
        action={(formData) => {
          if (!token) return;

          const start = formData.get('start') as string;
          const end = formData.get('end') as string;

          setSettings({
            token,
            start: start ? new Date(start).getTime() / 1000 : 0,
            end: end ? new Date(end).getTime() / 1000 : 0,
            min: Number(formData.get('min')),
            max: Number(formData.get('max')) || 0,
            prices: stages.map(({ price }) => price),
            amounts: stages.map(({ amount }) => amount),
          });
        }}
      >
        <h2 className="card-title justify-center text-3xl">Create Presale</h2>
        <div>
          <section className="flex justify-center items-end gap-4">
            <label className="form-control flex-1 max-w-xs">
              <div className="label">
                <span className="label-text">
                  Pick the token you want to sell
                </span>
              </div>
              <select
                className="select select-bordered"
                value={token?.mint.toString()}
                onChange={(e) =>
                  setToken(() =>
                    tokens.find(
                      ({ mint }) => e.target.value === mint.toString()
                    )
                  )
                }
              >
                <option value={''}>Select a token</option>
                {tokens.map((token) => (
                  <option
                    key={token.mint.toString()}
                    value={token.mint.toString()}
                  >
                    {token.name} | ({ellipsify(token.mint.toString())})
                  </option>
                ))}
              </select>
            </label>
            <button
              className="btn btn-outline btn-circle"
              onClick={() => refresh()}
            >
              <IconRefresh />
            </button>
          </section>
          <div className="divider" />
          <section className="flex justify-between gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start</span>
              </label>
              <input
                type="date"
                name="start"
                defaultValue={
                  settings?.start
                    ? new Date(settings.start * 1000)
                        .toISOString()
                        .split('T')[0]
                    : ''
                }
                placeholder="Start"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">End</span>
              </label>
              <input
                type="date"
                name="end"
                defaultValue={
                  settings?.end
                    ? new Date(settings.end * 1000).toISOString().split('T')[0]
                    : ''
                }
                placeholder="End"
                className="input input-bordered w-full"
              />
            </div>
          </section>
          <div className="divider" />
          <section className="flex justify-between gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Min</span>
              </label>
              <input
                type="number"
                name="min"
                defaultValue={settings?.min}
                placeholder="Min"
                required
                min={1}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Max</span>
              </label>
              <input
                type="number"
                name="max"
                defaultValue={settings?.max}
                placeholder="Max"
                className="input input-bordered w-full"
              />
            </div>
          </section>
          <div className="divider" />
          <section>
            {stage ? (
              <div className="mx-auto space-y-4">
                <span>Stage #{(stage.id || 0) + 1}</span>
                <div className="flex justify-between gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Price per token</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="SOL"
                      required
                      value={stage.price}
                      onChange={(e) =>
                        setStage((prev) => ({
                          ...prev,
                          price: Number(e.target.value),
                        }))
                      }
                      step={0.000000001}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Total tokens for sale</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount"
                      required
                      value={stage.amount}
                      onChange={(e) =>
                        setStage((prev) => ({
                          ...prev,
                          amount: Number(e.target.value),
                        }))
                      }
                      min={1}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={!stage.price || !stage.amount}
                  onClick={() => {
                    setStages((stages) => {
                      if (stage.id !== undefined && stage.id < stages.length)
                        return stages.map((s, i) =>
                          i === stage.id ? (stage as StageDetails) : s
                        );
                      return [...stages, stage as StageDetails];
                    });
                    setStage(undefined);
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div
                  className="btn btn-accent btn-sm"
                  onClick={() =>
                    setStage({
                      id: stages.length,
                    } as StageDetails)
                  }
                >
                  + Stage
                </div>
                <ul className="flex flex-wrap gap-4 mt-2 justify-around">
                  {stages.map(({ price, amount }, index) => (
                    <li key={index} className="card card-compact bg-base-100">
                      <div className="card-body items-center">
                        <h3 className="card-title">Stage {index + 1}</h3>
                        <span className="badge badge-info">
                          {formatter.format(amount)} x {price}
                        </span>
                        <span className="badge badge-secondary">
                          {formatter.format(amount * price)} sol
                        </span>
                        <div
                          className="absolute top-1 right-1 btn btn-circle btn-ghost btn-xs"
                          onClick={() =>
                            setStage({
                              id: index,
                              price,
                              amount,
                            })
                          }
                        >
                          <IconPencil />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
        <div className="card-actions justify-around border-t border-primary pt-2">
          <button className="btn btn-xs lg:btn-md btn-outline" onClick={cancel}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-xs lg:btn-md btn-primary"
            disabled={!token || !stages.length}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}

export function PresaleCreate({ owner }: { owner: PublicKey }) {
  const { initialize } = usePresaleProgram();
  const { tokens, refresh } = useOwnedTokens(owner);

  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [settings, setSettings] = useState<PresaleSettings | undefined>(
    undefined
  );

  return creating ? (
    settings && confirming ? (
      <PresaleSummary
        settings={settings}
        back={() => setConfirming(false)}
        creating={initialize.isPending}
        create={async () => {
          // if (!settings || initialize.isPending) return;
          try {
            await initialize.mutateAsync(settings);
            setCreating(false);
            setConfirming(false);
            setSettings(undefined);
          } catch (e) {
            console.error(e);
          }
        }}
      />
    ) : (
      <CreatePresaleForm
        tokens={tokens}
        refresh={refresh}
        cancel={() => {
          setCreating(false);
          setConfirming(false);
        }}
        settings={settings}
        setSettings={(settings) => {
          setSettings(settings);
          setConfirming(true);
        }}
      />
    )
  ) : (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => setCreating(true)}
      disabled={initialize.isPending}
    >
      Create {initialize.isPending && '...'}
    </button>
  );
}

export function PresaleList() {
  const { accounts, getProgramAccount } = usePresaleProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <PresaleCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function PresaleNotOpened({ start }: { start: number }) {
  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center space-y-6">
        <h2 className="card-title justify-center text-3xl">
          Presale not opened
        </h2>
        <p>Presale will start on {new Date(start).toLocaleString()}</p>
      </div>
    </div>
  );
}

function PresaleCard({ account }: { account: PublicKey }) {
  const { accountQuery, tokenQuery, closeMutation, purchase } =
    usePresaleProgramAccount({
      account,
    });

  const remaining = useMemo(() => {
    if (!accountQuery.data?.sold || !tokenQuery.data) return 0;
    const { sold, amounts } = accountQuery.data;
    const total = amounts.reduce((acc, amount) => acc.add(amount));
    return fromBN(total.sub(sold), tokenQuery.data.decimals);
  }, [accountQuery.data?.sold, tokenQuery.data?.decimals]);

  const { start, end, active } = useMemo(() => {
    if (!accountQuery.data) return { start: 0, end: 0, active: false };
    const now = Date.now();
    const start = fromBN(accountQuery.data.start) * 1000;
    const end = fromBN(accountQuery.data.end) * 1000;
    const active = start <= now && (end === 0 || end >= now);

    return {
      start,
      end: fromBN(accountQuery.data.end) * 1000,
      active,
    };
  }, [accountQuery.data?.start]);

  const { stage, available, state, stageTotal, price } = useMemo(() => {
    if (!start)
      return {
        state: 'loading',
        stage: 0,
        available: 0,
        stageTotal: 0,
        price: 0,
      };

    const stageTotal = fromBN(
      accountQuery.data?.amounts[0],
      tokenQuery.data?.decimals
    );
    if (
      !accountQuery.data ||
      BigInt(accountQuery.data.sold.toString()) === BigInt(0)
    )
      return {
        state: active ? 'open' : 'planned',
        stage: 1,
        available: stageTotal,
        stageTotal,
        price: fromBN(accountQuery.data?.prices[0], 9),
      };

    const { sold, amounts } = accountQuery.data;
    let total = sold;

    for (let i = 0; i < amounts.length; i++) {
      if (total.lt(amounts[i]))
        return {
          state: 'open',
          stage: i + 1,
          available: fromBN(amounts[i].sub(total), tokenQuery.data?.decimals),
          stageTotal: fromBN(amounts[i], tokenQuery.data?.decimals),
          price: fromBN(accountQuery.data?.prices[i], 9),
        };
      total = total.sub(amounts[i]);
    }

    return {
      state: 'closed',
      stage: amounts.length + 1,
      available: 0,
      stageTotal: 0,
      price: 0,
    };
  }, [accountQuery.data, tokenQuery.data?.decimals, start]);

  const { min, max } = useMemo(() => {
    if (!accountQuery.data || !tokenQuery.data)
      return { min: 1, max: available };

    return {
      min: fromBN(accountQuery.data.min, tokenQuery.data.decimals),
      max: Math.min(
        fromBN(accountQuery.data.max, tokenQuery.data.decimals),
        available
      ),
    };
  }, [accountQuery.data, tokenQuery.data, available]);

  return accountQuery.isLoading || !start ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center space-y-6">
        <h2
          className="card-title justify-center text-3xl cursor-pointer"
          onClick={() => accountQuery.refetch()}
        >
          {formatter.format(remaining)} {tokenQuery.data?.symbol}
        </h2>

        <div className="absolute top-0 left-0 right-0 px-2 flex justify-between">
          <span className="badge badge-accent badge-lg capitalize">
            {state}
          </span>
          <span className="badge badge-info badge-lg capitalize">
            Stage {stage}
          </span>
        </div>

        {state === 'open' ? (
          <>
            <div className="flex flex-col items-center gap-2 w-full max-w-md">
              <span className="badge badge-success">
                {formatter.format(available)} {tokenQuery.data?.symbol}
              </span>

              <ProgressBar
                score={(1 - available / stageTotal) * 100}
                hideText
              />
            </div>

            <form
              className="w-full max-w-md"
              action={async (formData) => {
                const amount = Number(formData.get('amount'));
                if (amount < min || (max > 0 && amount > max)) {
                  alert('Invalid amount');
                  return;
                }
                try {
                  await purchase.mutateAsync(amount);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">
                    Amount of {tokenQuery.data?.symbol}
                  </span>
                  <span className="label-text-alt">Price: {price}</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  min={min}
                  step={min}
                  max={max ? max : undefined}
                  placeholder={`How much ${tokenQuery.data?.symbol} do you want?`}
                  className="input input-bordered w-full max-w-xs"
                />
                <div className="label">
                  <span className="label-text-alt">
                    Min: {formatter.format(min)}
                  </span>
                  {max > 0 && (
                    <span className="label-text-alt">
                      Max: {formatter.format(max)}
                    </span>
                  )}
                </div>
              </label>

              <button type="submit" className="btn btn-primary">
                Buy
              </button>
            </form>
          </>
        ) : (
          <PresaleNotOpened start={start} />
        )}

        <div className="text-center space-y-4">
          <p>
            <ExplorerLink
              path={`account/${account}`}
              label={ellipsify(account.toString())}
            />
          </p>
          <button
            className="btn btn-xs btn-secondary btn-outline"
            onClick={() => {
              if (
                !window.confirm('Are you sure you want to close this account?')
              ) {
                return;
              }
              return closeMutation.mutateAsync();
            }}
            disabled={closeMutation.isPending}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
