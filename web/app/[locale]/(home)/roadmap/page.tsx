import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';

import type { Params } from '../../locale';
import { Nav, Details, type States } from './_ui';

const { NEXT_PUBLIC_PHASES_DATES = '', NEXT_PUBLIC_COMPLETED_PHASES = 0 } =
  process.env;
const dates = NEXT_PUBLIC_PHASES_DATES.split(',');
const activePhase = Number(NEXT_PUBLIC_COMPLETED_PHASES);

export default async function Roadmap({ params: { locale } }: Params) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  const t = messages['Roadmap'];

  if (!t || typeof t === 'string') return null;
  const steps = t['steps'];
  if (!steps || !Array.isArray(steps)) return null;

  const bg = "bg-[url('/assets/images/bg/roadmap.png')]";
  const className = [
    'hero min-h-screen w-full mx-auto',
    bg,
    'bg-cover bg-center bg-no-repeat',
  ].join(' ');

  return (
    <>
      <div className="w-full min-h-screen overflow-hidden relative">
        <div className={className}>
          <div className="hero-content text-amber-100 text-center">
            <div className="w-full md:container">
              <ul className="carousel rounded-box h-[70dvh] md:h-[50dvh] xl:gap-20 w-64 md:w-full">
                {steps.map(({ title, slug, description, tags }, i) => (
                  <li
                    id={`step-${i + 1}`}
                    key={i}
                    className="carousel-item w-full md:w-64 h-full relative items-center justify-center group select-none"
                  >
                    <figure className="relative w-full h-full pointer-events-none">
                      <Image
                        className="object-contain animate-float"
                        src={`/assets/images/roadmap/step_${i + 1}.png`}
                        alt={title}
                        fill
                      />
                    </figure>
                    <Link
                      href={`?details=${slug}&state=${
                        activePhase > i
                          ? 'completed'
                          : activePhase === i
                          ? 'active'
                          : activePhase + 1 === i
                          ? 'blocked'
                          : 'upcoming'
                      }&date=${dates[i] ?? ''}`}
                      className={`btn absolute bottom-8 shadow-xl group-hover:animate-glow group-hover:scale-125 ${
                        activePhase > i
                          ? 'btn-accent'
                          : activePhase === i
                          ? 'btn-primary'
                          : activePhase + 1 === i
                          ? 'btn-neutral'
                          : 'bg-amber-900/80'
                      }`}
                    >
                      <h2>{title}</h2>
                    </Link>
                    <p className="sr-only">{description}</p>
                    <ul className="sr-only">
                      {tags.split(',').map((tag: string, i: number) => (
                        <li key={i} className="badge">
                          {tag.trim()}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Nav steps={steps.length} />
      {typeof t['details'] !== 'string' && (
        <Details
          goals={t['goals'] as string}
          milestones={t['milestones'] as string}
          details={t['details']}
          states={t['state'] as States}
          dates={t['date'] as States}
        />
      )}
    </>
  );
}
