import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";

import React from "react";
import ReactPlayer from "react-player";

export async function getStaticProps(context) {
  return {
    props: {},
  };
}

export default function ParVagues() {
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
            ParVagues, c'est des ondes sonores qui naissent dans un océan
            binaire pour parfois s'échouer sur vos plages sonores.
          </h4>
          {/*<Image
          alt="ParVagues performing"
          src="/images/ParVagues.jpg"
          layout="fill"
          width={700}
          height={475}
        />*/}
        </section>
        <ReactPlayer url="https://soundcloud.com/parvagues/" />
      </div>
    </Layout>
  );
}
