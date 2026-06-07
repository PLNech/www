import { getPoemsData } from '@/lib/poems';
import PoemsBrowser from './PoemsBrowser';

export const metadata = {
  title: { absolute: 'Poems | Words into thoughts' },
  description: 'A collection of poems and thoughts',
};

export default function PoesiePage() {
  const poems = getPoemsData();
  return <PoemsBrowser poems={poems} />;
}
