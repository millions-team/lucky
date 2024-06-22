import { GamesProvider } from './_provider/games-provider';
import GamesFeature from '@/components/games/games-feature';

export default function Page() {
  return (
    <GamesProvider>
      <GamesFeature />
    </GamesProvider>
  );
}
