import { getAllLives, getLiveData, getLivesImages, getLiveTracks } from '@/lib/content';
import LiveEvent from '@/components/parvagues/LiveEvent';

export const revalidate = 60;

export function generateStaticParams() {
  return getAllLives().map((live) => ({ slug: live.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const live = await getLiveData(slug);
  const title = live.frontmatter?.title || slug;
  return { title: { absolute: `${title} - ParVagues` } };
}

export default async function LivePage({ params }) {
  const { slug } = await params;
  const live = await getLiveData(slug);
  const images = getLivesImages(slug);
  const tracks = getLiveTracks(slug);

  const isPostEvent =
    new Date() > new Date((live.frontmatter?.date || '2099-01-01') + 'T23:59:59');

  return (
    <LiveEvent live={live} images={images} tracks={tracks} isPostEvent={isPostEvent} />
  );
}
