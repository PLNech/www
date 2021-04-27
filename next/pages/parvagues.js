import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";

import SyntaxHighlighter from "react-syntax-highlighter";

import React from "react";
import ReactPlayer from "react-player";

export async function getStaticProps(context) {
  const tidalSampleUrl = "https://git.plnech.fr/pln/Tidal/raw/f5bfbc74e68dcaac0f6afa93f2b47d35321274c8/live/dnb/automne_electrique.tidal"
  const response = await fetch(tidalSampleUrl);
  const source = await response.text();
  // Remove working title
  const sourceClean = source.split("\n").slice(1).join("\n")

  return {
    props: {
      urlSC: "https://soundcloud.com/parvagues/",
      urlTwitch: "https://twitch.tv/parvagues/",
      urlTwitchExample: "https://www.twitch.tv/videos/965233250",
      urlAutomne: "https://soundcloud.com/parvagues/automne-electrique",
      tidalSample: sourceClean
    },
  };
}

export default function ParVagues({
  urlSC,
  urlTwitch,
  urlTwitchExample,
  tidalSample,
}) {
  return (
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ParVagues</title>
      </Head>
      <div>
        <section className={utilStyles.headingMd}>
          <h1>I create music with patterns</h1>
          <h4>
            <i>
              ParVagues, c'est des ondes sonores qui naissent dans un océan
              binaire pour parfois s'échouer sur vos plages sonores.
            </i>
          </h4>
          {/*<Image
          alt="ParVagues performing"
          src="/images/ParVagues.jpg"
          layout="fill"
          width={700}
          height={475}
        />*/}
        </section>
        <section className={utilStyles.headingMd}>
          <h5>
            A source sample: the code behind <a href="">Automne Électrique</a>:
          </h5>
          <SyntaxHighlighter
            className="source-code"
            width="64em"
            language="haskell"
            wrapLines={true}
          >
            {tidalSample}
          </SyntaxHighlighter>

        </section>
        <section className={utilStyles.headingMd}>
          <h4>
            I sometimes post recordings on <a href={urlSC}>SoundCloud</a>
          </h4>
          <div className="player-wrapper">
            <ReactPlayer
              className="react-player"
              url={urlSC}
              width="100%"
              height="32em"
            />
          </div>
        </section>
        <section className={utilStyles.headingMd}>
          <h4>
            I sometimes do live performances on <a href={urlTwitch}>Twitch</a>
          </h4>
          <div className="player-wrapper">
            <ReactPlayer
              className="react-player"
              url={urlTwitchExample}
              width="100%"
              height="32em"
            />
          </div>
        </section>
      </div>
    </Layout>
  );
}
