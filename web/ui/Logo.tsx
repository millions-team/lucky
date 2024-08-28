import Image from 'next/image';

const CLASS_NAME = {
  xs: 'w-20',
  sm: 'w-24',
  md: 'w-32',
  lg: 'w-40',
};

type LogoSize = keyof typeof CLASS_NAME;
type LogoProps = {
  size?: LogoSize;
};
export function Logo({ size = 'xs' }: LogoProps) {
  return (
    <figure className="relative">
      <Image
        src={'/logo.png'}
        alt="Luckyland Logo"
        className={CLASS_NAME[size]}
        width={256}
        height={256}
      />
    </figure>
  );
}
