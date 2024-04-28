import SyntaxHighlighter from "react-syntax-highlighter";
import Head from "next/head";
import Layout from "../../components/layout";
import HydraSynth from "../../components/hydra-view";
import Date from "../../components/date";
const https = require("https");
import { useRef } from "react";

import utilStyles from "../../styles/utils.module.css";
import { getAllHydraIds, getHydraData } from "../../lib/hydras";

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
  const canvasRef = useRef(null);
  return (
    <Layout>
      <Head>
        <title>{hydraData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{hydraData.title}</h1>
        <h3>See it running at the bottom of this page, or</h3>
        <h5>
          <i><a href={hydraData.link}>Run it fullscreen in your browser</a></i>
        </h5>
        {/* <canvas id={canvasRef}/> */}
        <HydraSynth width={700} height={475}
          canvasRef={canvasRef} source={hydraData.source} />
        <SyntaxHighlighter
          width="64em"
          language="javascript"
          wrapLongLines={true}>
          {hydraData.source}
        </SyntaxHighlighter>
      </article>
    </Layout>
  );
}
