import SyntaxHighlighter from "react-syntax-highlighter";
import Head from "next/head";
import Layout from "../../components/layout";
import Date from "../../components/date";
import { useState } from "react";
import dynamic from "next/dynamic";
import utilStyles from "../../styles/utils.module.css";
import { getAllHydraIds, getHydraData } from "../../lib/hydras";

// Dynamically import HydraSynth with SSR disabled
const HydraSynth = dynamic(
  () => import("../../components/hydra-view"),
  { ssr: false }
);

export async function getStaticProps({ params }) {
  const hydraData = await getHydraData(params.id);

  const response = await fetch(hydraData.source);
  const source = await response.text();
  const sourceCode = source.replace(/(?:\r\n|\r|\n)/g, "<br>");

  hydraData.source = source;

  return {
    props: {
      hydraData,
      sourceCode,
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
        
        {/* Hydra visualization */}
        <div className={utilStyles.hydraContainer}>
          <HydraSynth source={hydraData.source} />
        </div>
        
        {/* Fullscreen link */}
        <div className={utilStyles.hydraLinks}>
          <a href={hydraData.link} target="_blank" rel="noopener noreferrer">
            View fullscreen in your browser
          </a>
        </div>
        
        {/* Source code (conditionally rendered) */}
        <div className={utilStyles.codeContainer}>
            <SyntaxHighlighter
              language="javascript"
              wrapLongLines={true}>
              {hydraData.source}
            </SyntaxHighlighter>
        </div>
      </article>
    </Layout>
  );
}

// Suggestion for later:
// TODO: refactor to Dynamic import with SSR enabled.
// DISCUSS: What would be the benefit of this?
// AI opinion: It would be better to use a dynamic import with SSR enabled, 
// >because the HydraSynth component is not needed on the server side.
// >It's a client-side component that needs to be rendered on the client side.
// >So it's better to use a dynamic import with SSR enabled.
// Human: Ok -> TODO for next time someone changes this file, please do refactor to Dynamic import with SSR enabled.
// const HydraSynth = dynamic(
//   () => import('../../components/hydra-view'),
//   { ssr: false }
// )