import SyntaxHighlighter from "react-syntax-highlighter";
import Layout from "@/components/layout";
import utilStyles from "@/styles/utils.module.css";
import { getAllHydraIds, getHydraData } from "@/lib/hydras";
import HydraClient from "./HydraClient";

export function generateStaticParams() {
  return getAllHydraIds().map(({ params }) => params);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const hydraData = await getHydraData(id);
  return { title: hydraData.title };
}

export default async function Hydra({ params }) {
  const { id } = await params;
  const hydraData = await getHydraData(id);

  const response = await fetch(hydraData.source);
  hydraData.source = await response.text();

  return (
    <Layout>
      <article>
        <h1 className={utilStyles.headingXl}>{hydraData.title}</h1>

        {/* Hydra visualization */}
        <div className={utilStyles.hydraContainer}>
          <HydraClient source={hydraData.source} />
        </div>

        {/* Fullscreen link */}
        <div className={utilStyles.hydraLinks}>
          <a href={hydraData.link} target="_blank" rel="noopener noreferrer">
            View fullscreen in your browser
          </a>
        </div>

        {/* Source code */}
        <div className={utilStyles.codeContainer}>
          <SyntaxHighlighter language="javascript" wrapLongLines={true}>
            {hydraData.source}
          </SyntaxHighlighter>
        </div>
      </article>
    </Layout>
  );
}
