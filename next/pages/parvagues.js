import { getAllLives } from '@/lib/livesData';
import Layout from '@/components/parvagues/Layout';
import Hero from '@/components/parvagues/Hero';
import TourTimeline from '@/components/parvagues/TourTimeline';
import MusicSection from '@/components/parvagues/MusicSection';
import VideoSection from '@/components/parvagues/VideoSection';
import BookingForm from '@/components/parvagues/BookingForm';

export default function ParVagues({ lives }) {
  return (
    <Layout title="ParVagues — Musique Algorithmique">
      <Hero />
      <TourTimeline lives={lives} />
      <MusicSection />
      <VideoSection />
      <BookingForm />
    </Layout>
  );
}

export async function getStaticProps() {
  const allLives = getAllLives();

  // Only send fields needed by the landing page
  const lives = allLives.map(({ slug, year, title, date, location, audio, video, archive, ctaURL }) => ({
    slug, year, title, date, location,
    audio: audio || '',
    video: video || '',
    archive: archive || '',
    ctaURL: ctaURL || '',
  }));

  return {
    props: { lives },
    revalidate: 60,
  };
}
