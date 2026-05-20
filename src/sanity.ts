import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { CONFIG } from './config';

export const sanityClient = createClient({
  projectId: CONFIG.SANITY.PROJECT_ID,
  dataset: CONFIG.SANITY.DATASET,
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: CONFIG.SANITY.API_VERSION, // use current date (YYYY-MM-DD) to target the latest API version
  token: CONFIG.SANITY.TOKEN,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}
