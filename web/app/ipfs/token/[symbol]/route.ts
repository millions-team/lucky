import { NextRequest } from 'next/server';

import METADATA from './meta.json';

import { getTokenDefinition } from '@constants';

const { VERCEL_ENV = 'development', VERCEL_PROJECT_PRODUCTION_URL } =
  process.env;

const BASE_URL =
  VERCEL_ENV === 'development'
    ? 'http://localhost:3000'
    : `https://${VERCEL_PROJECT_PRODUCTION_URL}`;

async function getTokenWithMetadata(symbol: string) {
  const token = getTokenDefinition(symbol);
  const metadata = { name: token.name, symbol: token.symbol, ...METADATA };

  return { token, metadata };
}

export async function GET(
  request: NextRequest,
  { params: { symbol } }: { params: { symbol: string } }
) {
  const { token, metadata } = await getTokenWithMetadata(symbol);
  const image = `${BASE_URL}/token/${token.image}`;

  metadata.image = image;
  metadata.properties.files.forEach((file) => {
    if (file.type === 'image/png') file.uri = image;
  });

  return new Response(JSON.stringify(metadata), {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });
}
