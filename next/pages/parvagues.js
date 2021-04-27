import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";

import React from "react";
import ReactPlayer from "react-player";

export async function getStaticProps(context) {
  return {
    props: {
      urlSC: "https://soundcloud.com/parvagues/",
      urlTwitch: "https://twitch.tv/parvagues/",
      urlTwitchExample: "https://www.twitch.tv/videos/965233250"
    },
  };
}

export default function ParVagues({urlSC, urlTwitch, urlTwitchExample}) {
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
            <i>ParVagues, c'est des ondes sonores qui naissent dans un océan
            binaire pour parfois s'échouer sur vos plages sonores.</i>
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
        <h4>I sometimes post recordings on <a href={urlSC}>SoundCloud</a></h4>
        <div className='player-wrapper'>
          <ReactPlayer
            className='react-player'
            url={urlSC}
            width='100%'
            height='32em'
          />
        </div>
        </section>
        <section className={utilStyles.headingMd}>
        <h4>I sometimes do live performances on <a href={urlTwitch}>Twitch</a></h4>
        <div className='player-wrapper'>
          <ReactPlayer
            className='react-player'
            url={urlTwitchExample}
            width='100%'
            height='32em'
          />
        </div>
        </section>
      </div>
    </Layout>
  );
}
