import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "../components/layout";
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

export default function Hydra({ hydras }) {
  return (
    <Layout className="hydra">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>PLN's Hydra works</title>
      </Head>
      <div>
        <h1>I create visuals with patterns</h1>
        <iframe
          width={700}
          height={475}
          src="https://diode.zone/videos/embed/3011ef6f-7684-4b74-81b2-37e20249bca2?api=1"
        />
        <p>
          <i>
            <a 
              href="https://nech.pl/glitchpool" 
              className={utilStyles.inlineLink}
            >
              GLITCHP00L
            </a>, a work in which a blue bar becomes the colorful frontier
            of s1gnal and n0ise.{" "}
          </i>
        </p>
        <br />
        <Image
          alt="GaLactic intermediary steps"
          src="/images/WIP_GaLactic.png"
          width={700}
          height={475}
        />
        <p>
          <i>
            Successive layers within the work{" "}
            <a 
              href="https://nech.pl/nights-galactic" 
              className={utilStyles.inlineLink}
            >
              GaLactic
            </a>, part of the
            serie <b>Nuits étoilées</b>
            <br />
            in which I turn pictures of the night sky into animated windows on
            the universe.
          </i>
        </p>

        <br />

        <h4>
          All my Hydra <a 
            href="https://git.plnech.fr/pln/Hydra" 
            className={utilStyles.inlineLink}
          >
            code
          </a> is{" "}
          <i>free software</i> : you are free to run it, study it, modify it or share it
          as you like.
        </h4>
        <br />
        <br />

        <h2>Some works</h2>
        <div className={utilStyles.list}>
          {hydras.map(({ id, title, link }) => (
            <div className={utilStyles.hydraCard} key={id}>
              <Link 
                href={`/hydra/${id}`} 
                className={utilStyles.listItemLink}
              >
                {title}
              </Link>
              
              <div className={utilStyles.poemMeta}>
                <span className={utilStyles.poemMetaItem}>
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={utilStyles.inlineLink}
                  >
                    View fullscreen
                  </a>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
