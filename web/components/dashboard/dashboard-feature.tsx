'use client';

import { PlayButton } from '@/components/shared';

export default function DashboardFeature() {
  return (
    <div className="hero min-h-full bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hello there</h1>
          <p className="py-6">
            Wanna try your luck? Click the button below to get started.
          </p>
          <PlayButton />
        </div>
      </div>
    </div>
  );
}
