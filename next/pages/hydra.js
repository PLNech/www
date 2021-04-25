import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "../components/layout";
import HydraSynth from "../components/hydra";
import utilStyles from "../styles/utils.module.css";
import { getHydrasData } from "../lib/hydras";

export async function getStaticProps() {
  const hydras = getHydrasData();

  return {
    props: {
      hydras,
    },
  };
}

export default function Hydra({hydras}) {
  return (
    <Layout className="hydra">
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
        <p>
          <i>
            Intermediary steps of{" "}
            <a href="https://nech.pl/nights-galactic">GaLactic</a>
          </i>
        </p>

        <br />
        <h2>Some works</h2>
        <ul className={utilStyles.list}>
          {hydras.map(
            ({
              id,
              title,
            }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/hydra/${id}`}><h4> {title}</h4></Link>
              </li>
            )
          )}
        </ul>
      </div>
    </Layout>
  );
}
