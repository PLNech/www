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
  const [showCode, setShowCode] = useState(false);
  
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
// 
// Dynamic import with SSR disabled
// const HydraSynth = dynamic(
//   () => import('../../components/hydra-view'),
//   { ssr: false }
// )
// 
// export default function Hydra({ hydraData, sourceCode }) {
//   const canvasRef = useRef(null);
// 
//   return (
//     <Layout>
//       {/* ... rest of your component ... */}
// 
//       {/* Now this will only run on the client side */}
//       <HydraSynth 
//         width={700} 
//         height={475}
//         canvasRef={canvasRef} 
//         source={hydraData.source} 
//       />
// 
//       {/* ... rest of your component ... */}
//     </Layout>
//   );
// }
