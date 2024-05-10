import { notFound } from 'next/navigation';
import ClusterFeature from '@/components/cluster/cluster-feature';

const { NEXT_PUBLIC_VERCEL_ENV = 'development' } = process.env;

export default function Page() {
  if (NEXT_PUBLIC_VERCEL_ENV === 'production') return notFound();
  return <ClusterFeature />;
}
