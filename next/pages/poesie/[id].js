import Head from 'next/head';
import Layout from '@/components/layout';
import Date from '@/components/date';
import utilStyles from '@/styles/utils.module.css';
import { getPoemData, getAllPoemIds } from '@/lib/poems';

export async function getStaticProps({ params }) {
  const poemData = await getPoemData(params.id);
  return {
    props: {
      poemData,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllPoemIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Poem({ poemData }) {
  return (
    <Layout>
      <Head>
        <title>{poemData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{poemData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={poemData.date} />
          {poemData.language && ` • ${poemData.language}`}
          {poemData.tags && poemData.tags.length > 0 && ` • ${poemData.tags.join(', ')}`}
        </div>
        <div 
          className={utilStyles.poemContent}
          dangerouslySetInnerHTML={{ __html: poemData.contentHtml }} 
        />
      </article>
    </Layout>
  );
} 