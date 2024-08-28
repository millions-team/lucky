'use client';

import { useMemo } from 'react';
import type { AbstractIntlMessages } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

type Milestone = {
  title: string;
  description?: string;
  tags: string;
  tasks: Array<string>;
};
type StepDetails = {
  title: string;
  description: string;
  goals: Array<string>;
  milestones: Array<Milestone>;
};
type StepSlug = string;
type Steps = Record<StepSlug, StepDetails>;

export type States = {
  completed: string;
  active: string;
  blocked: string;
  upcoming: string;
};

const CLASSNAMES = {
  completed: {
    bg: '',
    badge: 'badge-success',
    divider: 'divider-success',
  },
  active: {
    bg: '',
    badge: 'badge-info',
    divider: 'divider-info',
  },
  blocked: {
    bg: '',
    badge: 'badge-error',
    divider: 'divider-error',
  },
  upcoming: {
    bg: '',
    badge: 'badge-primary',
    divider: 'divider-primary',
  },
};

type DetailsProps = {
  details: AbstractIntlMessages;
  goals: string;
  milestones: string;
  states: States;
  dates: States;
};
export function Details({
  details,
  goals: _goals,
  milestones: _milestones,
  states,
  dates,
}: DetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const steps = useMemo(() => details as unknown as Steps, [details]);
  const step = searchParams.get('details');
  if (!step || !steps[step]) return null;

  const { title, description, goals = [], milestones = [] } = steps[step];
  const state = (searchParams.get('state') || 'upcoming') as keyof States;

  const date = `${dates[state]} ${new Date(
    searchParams.get('date') || Date.now()
  ).toLocaleDateString()}`;

  return (
    <dialog
      role="dialog"
      className="modal modal-bottom sm:modal-middle modal-open"
    >
      <div
        className={`modal-box sm:max-h-[70dvh] flex flex-col ${CLASSNAMES[state].bg}`}
      >
        <button
          onClick={router.back}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="py-4">{description}</p>

        <div className="join join-vertical w-full flex-1 overflow-auto">
          <div className="collapse collapse-arrow join-item bg-base-300 border">
            <input type="radio" name="sections" defaultChecked />
            <h4 className="collapse-title text-xl font-medium flex justify-between items-center">
              <span>‣ {_goals}</span>
              <span className={`badge ${CLASSNAMES[state].badge}`}>
                {states[state]}
              </span>
            </h4>
            <div className="collapse-content flex-1 overflow-auto">
              <ul className="pl-4 space-y-2">
                {goals.map((task, i) => (
                  <li key={i} className="items-center">
                    ⦿ {task}
                  </li>
                ))}
              </ul>

              {state !== 'upcoming' && (
                <div className={`divider ${CLASSNAMES[state].divider}`}>
                  <div className="divider-text">{date}</div>
                </div>
              )}
            </div>
          </div>
          <div className="collapse collapse-arrow join-item bg-base-300 border">
            <input type="radio" name="sections" />
            <h4 className="collapse-title text-xl font-medium">
              ‣ {_milestones}
            </h4>
            <div className="collapse-content flex-1 overflow-auto">
              <ul className="px-4 space-y-2">
                {milestones.map(({ title, description, tasks }, i) => (
                  <div key={i} className="collapse collapse-arrow">
                    <input type="radio" name="tasks" />
                    <div className="collapse-title text-xl font-medium">
                      {title}
                    </div>
                    <div className="collapse-content">
                      <ul className="pl-4 space-y-2 border-l">
                        {tasks.map((task, j) => (
                          <li key={j} className="items-center">
                            ⦿ {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={router.back}>close</button>
      </form>
    </dialog>
  );
}
