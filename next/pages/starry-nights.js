import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "../components/layout";
import HydraSynth from "../components/hydra-view";
import utilStyles from "../styles/utils.module.css";

export default function NuitsEtoilees() {
  return (
    <Layout className="hydra">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Nuits Étoilées</title>
      </Head>
      <div>
        <h1>Nuits Étoilées</h1>
        <br />
        <p>
          Nuits étoilées est une série de tableaux animés démarrée en 2021, qui
          cherche à transmettre mon émerveillement face aux étoiles et à
          l’univers gigantesque qui nous entoure. <br />
          Utilisant Hydra pour définir des transformations appliquées à une
          image, elles combinent des images, vidéos ou caméras à des techniques
          élémentaires de transformation spatiale pour souligner les similarités
          ou le contraste entre ces phénomènes mathématiques et l'immensité
          spatiale. <br />
          Ces œuvres peuvent être incarnées sur n’importe quel écran, en suivant
          un lien dans un navigateur : elles sont ainsi publiques et
          portables... Même si elles rendent mieux sur un grand format paysage
          ;) <br />
          <br />
          Chacune est basée sur une image dans le domaine public du ciel, et la
          transforme à l’aide d'un code visible pour en faire un paysage animé,
          plus ou moins aléatoire ou périodique, venant surprendre avec des
          évènements rares inattendus ou inviter à la contemplation :
        </p>

        <i>(suivre le lien sur chaque titre pour voir l’oeuvre s’animer)</i>
        <br />
        <br />
        <ul className={utilStyles.list}>
          <Link href="https://nech.pl/halley">
            <li>
              <h3>
                <a href="https://nech.pl/halley">⮞ Dusty Halley</a>
              </h3>
              <p>
                Pour la{" "}
                <a href="https://fr.wikipedia.org/wiki/1P/Halley#/media/Fichier:Lspn_comet_halley.jpg">
                  photo iconique de 1986
                </a>{" "}
                de la comète de Halley
              </p>
              <Image
                alt="Dusty Halley still"
                src="/images/halley.png"
                width={600}
                height={400}
              />
              <p>
                <a href="https://git.plnech.fr/pln/Hydra/raw/master/StarryNights/DustyHalley.js">
                  Code source
                </a>
              </p>
            </li>
          </Link>
          <Link href="https://nech.pl/edge">
            <li>
              <h3>
                <a href="https://nech.pl/edge">⮞ Edge of Destruction</a>
              </h3>
              <p>
                Pour une{" "}
                <a href="https://www.nasa.gov/feature/goddard/2021/hubble-captures-giant-star-on-the-edge-of-destruction">
                  image d’étoile géante à la limite de l’autodestruction
                </a>{" "}
                <br />
                partagée lors du 31ème anniversaire du télescope Hubble
              </p>
              <Image
                alt="Edge of Destruction still"
                src="/images/edge.png"
                width={600}
                height={400}
              />
              <p>
                <a href="https://git.plnech.fr/pln/Hydra/raw/master/StarryNights/Edge.js">
                  Code source
                </a>
              </p>
            </li>
          </Link>
          <Link href="https://nech.pl/ariane13">
            <li>
              <h3>
                <a href="https://nech.pl/ariane13">⮞ Ariane13</a>
              </h3>
              <p>
                Basé sur une photo prise par Hubble{" "}
                <a href="https://www.nasa.gov/content/goddard/what-did-hubble-see-on-your-birthday/">
                  un jour particulier pour vous
                </a>{" "}
              </p>
              <Image
                alt="Ariane13 still"
                src="/images/ariane13.png"
                width={600}
                height={400}
              />
              <p>
                <a href="https://git.plnech.fr/pln/Hydra/raw/master/StarryNights/Ariane13.js">
                  Code source
                </a>
              </p>
            </li>
          </Link>
        </ul>
      </div>
    </Layout>
  );
}
