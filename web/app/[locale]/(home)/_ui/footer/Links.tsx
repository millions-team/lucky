import {
  IconSet,
  GithubIcon,
  XIcon,
  TelegramIcon,
  DexScreenerIcon,
  JupiterIcon,
} from '@/ui/icons';

const { Icon } = IconSet({
  github: GithubIcon,
  x: XIcon,
  telegram: TelegramIcon,
  dex: DexScreenerIcon,
  jup: JupiterIcon,
});

const {
  NEXT_PUBLIC_REPO_NAME = '',
  NEXT_PUBLIC_X_USERNAME = '',
  NEXT_PUBLIC_TELEGRAM_USERNAME = '',
  NEXT_PUBLIC_DEX_ID = '',
  NEXT_PUBLIC_CA = '',
} = process.env;

const LINKS = [
  { name: 'github', href: `https://github.com/${NEXT_PUBLIC_REPO_NAME}` },
  { name: 'x', href: `https://x.com/${NEXT_PUBLIC_X_USERNAME}` },
  { name: 'telegram', href: `https://t.me/${NEXT_PUBLIC_TELEGRAM_USERNAME}` },
  { name: 'dex', href: `https://dexscreener.com/solana/${NEXT_PUBLIC_DEX_ID}` },
  { name: 'jup', href: `https://jup.ag/swap/SOL-${NEXT_PUBLIC_CA}` },
];

export function Links() {
  return (
    <div className="flex flex-col-reverse lg:flex-row lg:gap-4 text-white bg-base-300/20 p-2 xs:p-4 rounded-box">
      {LINKS.map(({ name, href }) => (
        <a
          key={name}
          href={href}
          className="btn btn-circle btn-ghost"
          target="_blank"
        >
          <Icon
            name={name}
            className="pointer-events-none w-8 h-8 text-white fill-white"
          />
        </a>
      ))}
    </div>
  );
}
