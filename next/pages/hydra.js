import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "../components/layout";

export async function getStaticProps(context) {
  return {
    props: {},
  };
}

export default function Hydra() {
  return (
    <Layout>
      <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>PLN's Hydra works</title>
      </Head>
      <div>
        <h1>I create visuals with patterns</h1>
        <Image
          alt="GaLactic intermediary steps"
          src="/images/WIP_GaLactic.png"
          // layout="fill"
          width={700}
          height={475}
        />
        <p><i>Intermediary steps of <a href="https://nech.pl/nights-galactic">GaLactic</a></i></p>
      </div>
      </Layout>
  );
}
