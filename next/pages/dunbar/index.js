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
        </Head>
        <DunbarApp />
      </Layout>
    </div>
  );
}
