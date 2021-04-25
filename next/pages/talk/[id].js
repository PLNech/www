import Head from "next/head";
import Layout from "../../components/layout";
import Date from "../../components/date";

import utilStyles from "../../styles/utils.module.css";
import { getTalkData, getTalksData, getAllTalkIds } from "../../lib/talks";

export async function getStaticProps({ params }) {
  const data = await getTalkData(params.id);
  return {
    props: {
      data,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllTalkIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Talk({ data }) {
  return (
    <Layout>
      <Head>
        <title>{data.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{data.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={data.date} dateFormat="YY MMM" />
        </div>
        {data.event && data.context && (
          <p>
            {" "}
            at <a href={data.event}>{data.context}</a> by {data.org}
          </p>
        )}
        <div className={utilStyles.lightText}></div>
        <div className={utilStyles.lightText}></div>
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
      </article>
    </Layout>
  );
}
