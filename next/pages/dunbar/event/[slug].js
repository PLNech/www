import Head from 'next/head';
import Layout from '@/components/layout';
import DunbarApp from '@/components/dunbar/DunbarApp';

// Client-only page; do not export getServerSideProps/getStaticProps
export default function DunbarEventPage() {
  const desc =
    'Dunbar — Event details in the privacy-first relationship navigator prototype. Local-only data, networks, events, and orbits.';

  return (
    <div className="container">
      <Layout>
        <Head>
          <title>Dunbar — Event</title>
          <meta name="robots" content="noindex" />
          <meta name="description" content={desc} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Dunbar — Event" />
          <meta name="twitter:description" content={desc} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Dunbar — Event" />
          <meta property="og:description" content={desc} />
        </Head>
        <DunbarApp />
      </Layout>
    </div>
  );
}
