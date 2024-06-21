'use client';

import { useState } from 'react';
import styles from './styles.module.css';

const MIN = 1;
const MAX = 99;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomArray(length: number, min: number, max: number) {
  return Array.from({ length }, () => randomInt(min, max));
}

export function PlayButton({
  reset,
  onPlay,
}: {
  onPlay?: (seed: number) => void;
  reset?: boolean;
}) {
  const [result, setResult] = useState<number>(NaN);
  const [pending, setPending] = useState<boolean>(false);
  const [values, setValues] = useState<number[]>(randomArray(8, MIN, MAX));
  const [intervalRef, setIntervalRef] = useState<NodeJS.Timeout | null>(null);
  const [playTimeout, setPlayTimeout] = useState<number>(1000);
  const [match, setMatch] = useState(false);

  const shiftAndPush = () => {
    setValues((values) => randomArray(values.length, MIN, MAX));
    setPlayTimeout(randomInt(500, 3000));
  };

  const start = () => {
    setResult(NaN);
    shiftAndPush();

    setIntervalRef(setInterval(shiftAndPush, 100));
  };

  const play = () => {
    setPending(true);
    intervalRef && clearInterval(intervalRef);

    setTimeout(() => {
      const pos = randomInt(1, values.length);
      const value = values[pos - 1];
      const match = value % values.length === pos - 1;
      setResult(pos);
      setMatch(match);
      onPlay && onPlay(value);
      setPending(false);

      reset &&
        match &&
        setTimeout(() => {
          setMatch(false);
          setResult(NaN);
        }, 5000);
    }, playTimeout);
  };

  return (
    <button
      className={`${styles.border} bg-[url('/img/push-me/play.svg')] bg-center bg-no-repeat bg-cover`}
      onMouseDown={start}
      onMouseUp={play}
      onTouchStart={start}
      onTouchEnd={play}
      disabled={pending || match}
      data-pending={pending}
      data-match={match}
      data-revealed={!Number.isNaN(result)}
      data-result={result || undefined}
    >
      <div className={`${styles.door} w-full h-full`}>
        <div className={`${styles.button}`}>
          Push
          <br />
          Me
        </div>
        {values.map((value, i) => (
          <div
            key={i}
            className={[
              styles.value,
              result === i + 1 ? styles.active : '',
              value % values.length === i ? styles.match : '',
            ].join(' ')}
            style={{ gridArea: `i${i + 1}` }}
            data-area={`i${i + 1}`}
          />
        ))}
      </div>
    </button>
  );
}
