'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type NavProps = {
  steps: number;
  active?: number;
};
export function Nav({ steps, active }: NavProps) {
  const router = useRouter();
  const [i, setI] = useState(active || 1);

  const handleClick = (di: number) => {
    const target = Math.max(1, Math.min(i + di, steps));
    setI(target);
    router.replace(`#step-${target}`);
  };

  return (
    <div className="absolute left-2 sm:left-5 right-2 sm:right-5 top-1/2 -translate-y-1/2 flex transform justify-between">
      {i > 1 ? (
        <button onClick={() => handleClick(-1)} className="btn btn-circle">
          ❮
        </button>
      ) : (
        <span />
      )}
      {i + 1 < steps && (
        <button onClick={() => handleClick(1)} className="btn btn-circle">
          ❯
        </button>
      )}
    </div>
  );
}
