const { METADATA_API_URL: baseURL } = process.env;
if (!baseURL) throw new Error('METADATA_API_URL is required');

export function getMetadataURI(symbol: string) {
  return `${baseURL}/${symbol}`;
}
