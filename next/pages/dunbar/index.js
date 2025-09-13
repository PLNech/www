import Head from 'next/head';
import Layout from '@/components/layout';
import DunbarApp from '@/components/dunbar/DunbarApp';

export default function DunbarPage() {
  return (
    <div className="container">
      <Layout>
        <Head>
          <title>Dunbar — Relationship Navigator</title>
          <meta name="robots" content="noindex" />
          <meta
            name="description"
            content="Dunbar — a privacy-first relationship navigator prototype. Local-only data, no analytics, organize friends, events, and networks."
          />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Dunbar — Relationship Navigator" />
          <meta
            name="twitter:description"
            content="Privacy-first relationship navigator prototype. Local-only data, networks, events, and orbits."
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Dunbar — Relationship Navigator" />
          <meta
            property="og:description"
            content="Privacy-first relationship navigator prototype. Local-only data, networks, events, and orbits."
          />
        </Head>
        <DunbarApp />
      </Layout>
    </div>
  );
}
