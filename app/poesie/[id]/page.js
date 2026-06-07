import Layout from "@/components/layout";
import Date from "@/components/date";
import utilStyles from "@/styles/utils.module.css";
import { getPoemData, getAllPoemIds } from "@/lib/poems";
import Link from "next/link";

export function generateStaticParams() {
  return getAllPoemIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const poemData = await getPoemData(id);
  return {
    title: poemData.title,
    description: `${poemData.title} - Poem by PLN`,
  };
}

export default async function Poem({ params }) {
  const { id } = await params;
  const poemData = await getPoemData(id);

  return (
    <Layout>
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
