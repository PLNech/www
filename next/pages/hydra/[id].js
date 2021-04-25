import Head from "next/head";
import Layout from "../../components/layout";
import HydraSynth from "../../components/hydra";
import Date from "../../components/date";
const https = require('https')

import utilStyles from "../../styles/utils.module.css";
import { getAllHydraIds, getHydraData } from "../../lib/hydras";

export async function getStaticProps({ params }) {
  const hydraData = await getHydraData(params.id);

  const response = await fetch(hydraData.source);
  const source = await response.text();
  const sourceCode = source.replace(/(?:\r\n|\r|\n)/g, '<br>');
  console.log(sourceCode);

  hydraData.source = source;

  return {
    props: {
      hydraData,
      sourceCode
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllHydraIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Hydra({ hydraData, sourceCode }) {
  return (
    <Layout>
      <Head>
        <title>{hydraData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{hydraData.title}</h1>
        <p className="code" dangerouslySetInnerHTML={{ __html: sourceCode }} />
      </article>
      <HydraSynth
      width={700}
      height={475}
      source={hydraData.source}/>
    </Layout>
  );
}
