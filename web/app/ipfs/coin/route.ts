import metadata from './meta.json';
import { NAME, SYMBOL } from './constants';

const { VERCEL_ENV = 'development', VERCEL_PROJECT_PRODUCTION_URL } =
  process.env;

const BASE_URL =
  VERCEL_ENV === 'development'
    ? 'http://localhost:3000'
    : `https://${VERCEL_PROJECT_PRODUCTION_URL}`;

const image = `${BASE_URL}/coin/lucky.png`;
export async function GET(request: Request) {
  metadata.name = NAME;
  metadata.symbol = SYMBOL;
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
