import Head from 'next/head';
import Layout from '@/components/layout';
import DunbarApp from '@/components/dunbar/DunbarApp';

/**
 * Unified Dunbar catch-all page.
 * Handles:
 *  - /dunbar                  → Events tab (main view)
 *  - /dunbar/friends          → Friends list
 *  - /dunbar/friends/:slug    → Friends detail (resolved by DunbarApp)
 *  - /dunbar/orbits           → Orbits
 *  - /dunbar/network          → Network
 *
 * DunbarApp parses the current path and selects the correct tab / friend.
 * Keeping a single page prevents page-level remounts and preserves SPA feel.
 */
export default function DunbarCatchAllPage() {
  return (
    <div className="container">
      <Layout>
        <Head>
          <title>Dunbar</title>
          <meta name="robots" content="noindex" />
          <meta name="description" content="Dunbar — privacy-first relationship navigator" />
        </Head>
        <DunbarApp />
      </Layout>
    </div>
  );
}
