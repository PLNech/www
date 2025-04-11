import Head from 'next/head';
import Layout from '@/components/layout';
import Date from '@/components/date';
import utilStyles from '@/styles/utils.module.css';
import { getPoemData, getAllPoemIds } from '@/lib/poems';
import Link from 'next/link';

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
        <meta name="description" content={`${poemData.title} - Poem by PLN`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Link href="/poesie" className={utilStyles.backLink}>
        ← Back to poems
      </Link>
      
      <article className={utilStyles.poemContainer}>
        <header>
          <h1 className={utilStyles.headingXl}>{poemData.title}</h1>
          
          <div className={utilStyles.poemMeta}>
            {poemData.date && (
              <span className={utilStyles.poemMetaItem}>
                <Date dateString={poemData.date} />
              </span>
            )}
            
            {poemData.language && (
              <span className={utilStyles.poemMetaItem}>
                {poemData.language}
              </span>
            )}
          </div>
          
          {poemData.tags && poemData.tags.length > 0 && (
            <div className={utilStyles.tagList}>
              {poemData.tags.map(tag => (
                <span key={tag} className={utilStyles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        
        <div 
          className={utilStyles.poemContent}
          dangerouslySetInnerHTML={{ __html: poemData.contentHtml }} 
        />
      </article>
    </Layout>
  );
} 