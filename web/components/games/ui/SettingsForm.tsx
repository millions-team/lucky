import { useState } from 'react';

import { encodeName, type GameMode } from '@luckyland/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { IconSeeding } from '@tabler/icons-react';

export function SettingsForm({
  game = false,
  settings: _init = { pickWinner: false } as GameMode,
  title = 'Game Settings',
  subtitle,
  className,
  onSubmit,
  onCancel,
}: {
  title?: string;
  subtitle?: string;
  game?: boolean;
  settings?: GameMode;
  className?: string;
  onSubmit: (
    settings: GameMode,
    gameName?: Array<number>,
    seed?: string
  ) => Promise<void>;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(_init);
  const [name, setName] = useState('');

  const [seeding, setSeeding] = useState(false);
  const [seed, setSeed] = useState(Keypair.generate().publicKey.toBase58());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      settings.pickWinner =
        settings.winnerChoice === 0 ? false : settings.pickWinner;

      await onSubmit(settings, game ? encodeName(name) : undefined, seed);
      reset(true);
    } catch (e) {
      console.log(e);
      reset();
    }
  };

  const reset = (success?: boolean) => {
    setSubmitting(false);
    if (success) {
      setName('');
      setSettings({} as GameMode);
    }
  };

  return (
    <div className={`card w-full max-w-md glass ${className}`}>
      <div className="card-body">
        <div className="card-title flex-col justify-center">
          <h2 className="text-3xl">{title}</h2>
          <h4 className="text-sm text-info">{subtitle}</h4>
          {game && (
            <button
              className="absolute top-4 right-6 btn btn-ghost btn-circle"
              onClick={() => setSeeding((c) => !c)}
            >
              <IconSeeding />
            </button>
          )}
        </div>

        <form onSubmit={submit}>
          {game && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Name"
                  required
                  className="input input-bordered input-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {seeding && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Seed</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Seed"
                    required
                    className="input input-bordered input-primary"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div className="form-control border-t-2 mt-4">
            <label className="label">
              <span className="label-text text-xl">Slots</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Count</span>
                </label>
                <input
                  type="number"
                  placeholder="Number of slots"
                  className="input input-bordered input-primary"
                  required
                  step={1}
                  min={1}
                  max={16}
                  value={settings.slots || ''}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      slots: Math.max(
                        Math.min(parseInt(e.target.value), 16),
                        1
                      ),
                    }))
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Digits</span>
                </label>
                <input
                  type="number"
                  placeholder="Digits per Slot"
                  className="input input-bordered input-primary"
                  required
                  step={1}
                  min={1}
                  max={8}
                  value={settings.digits || ''}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      digits: Math.max(
                        Math.min(parseInt(e.target.value), 8),
                        1
                      ),
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-control border-t-2 mt-4">
            <label className="label">
              <span className="label-text text-xl">Choices</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Number</span>
                </label>
                <input
                  type="number"
                  placeholder="Number of choices"
                  className="input input-bordered input-primary"
                  required
                  disabled={!settings.digits}
                  step={1}
                  min={2}
                  max={10 ** settings.digits - 1 || 2}
                  value={settings.choices || ''}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      choices: Math.max(
                        Math.min(
                          parseInt(e.target.value),
                          10 ** settings.digits - 1
                        ),
                        2
                      ),
                    }))
                  }
                />
                <label className="label justify-end">
                  <span className="label-text-alt">
                    {settings.choices} choices
                  </span>
                </label>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    {settings.pickWinner ? 'Default Winner' : 'Winner'}
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="Choice"
                  className="input input-bordered input-primary"
                  required
                  disabled={!settings.choices}
                  step={1}
                  min={settings.slots > 1 ? 0 : 1}
                  max={settings.choices || 1}
                  value={settings.winnerChoice ?? ''}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      winnerChoice: Math.max(
                        Math.min(parseInt(e.target.value), settings.choices),
                        settings.slots > 1 ? 0 : 1
                      ),
                    }))
                  }
                />
                <label className="label justify-end">
                  <span className="label-text-alt">
                    {settings.winnerChoice === 0
                      ? 'Any equal'
                      : settings.winnerChoice}{' '}
                    choice in {settings.slots} slots
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-control bg-base-100 rounded-badge px-2.5 mt-2">
            <label className="cursor-pointer label">
              <span className="label-text">Player pick winner</span>
              <input
                type="checkbox"
                className="toggle toggle-info"
                disabled={!settings.winnerChoice}
                checked={
                  settings.winnerChoice === 0 ? false : settings.pickWinner
                }
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    pickWinner: e.target.checked,
                  }))
                }
              />
            </label>
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
