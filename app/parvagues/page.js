import { getAllLives } from '@/lib/livesData';
import Hero from '@/components/parvagues/Hero';
import BioSection from '@/components/parvagues/BioSection';
import AsSeenAt from '@/components/parvagues/AsSeenAt';
import TourTimeline from '@/components/parvagues/TourTimeline';
import MusicSection from '@/components/parvagues/MusicSection';
import VideoSection from '@/components/parvagues/VideoSection';
import BookingForm from '@/components/parvagues/BookingForm';

export const revalidate = 60;

export const metadata = {
  title: { absolute: 'ParVagues - Musique Algorithmique' },
};

export default function ParVaguesPage() {
  const allLives = getAllLives();

  // Only send fields needed by the landing page
  const lives = allLives.map(({ slug, year, title, date, location, audio, video, archive, ctaURL }) => ({
    slug, year, title, date, location,
    audio: audio || '',
    video: video || '',
    archive: archive || '',
    ctaURL: ctaURL || '',
  }));

  return (
    <>
      <Hero />
      <BioSection />
      <AsSeenAt />
      <TourTimeline lives={lives} />
      <MusicSection />
      <VideoSection />
      <BookingForm />
    </>
  );
}
