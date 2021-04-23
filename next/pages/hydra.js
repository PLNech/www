import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

export async function getStaticProps(context) {
  return {
    props: {},
  };
}

export default function Hydra() {
  return (
    <Head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>PLN's Hydra works</title>
    </Head>
    <div>
      <h1>I create visuals with patterns</h1>
      <Image
        alt="Mountains"
        src="/images/WIP_GaLactic.png"
        layout="fill"
        // width={700}
        // height={475}
      />
    </div>
  );
}
