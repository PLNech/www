import Head from "next/head";
import Link from "next/link";
import Date from "../components/date";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getPostsData } from "../lib/posts";
import { getRecentTalksData } from "../lib/talks";

export async function getStaticProps() {
  const nbLastTalks = 3;
  const talks = getRecentTalksData();
  const posts = getPostsData();

  return {
    props: {
      posts,
      talks,
    },
  };
}

export default function Home({ posts, talks }) {
  return (
    <div className="container">
      <Layout home>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>PLN's Home</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <section className={utilStyles.headingMd}>
          <h1 className="title">Bienvenue !</h1>
          <h2>
            I'm PLN, and I love to <i>transform…</i>
          </h2>

          <h3>
            …code into <em>solutions to human problems</em>
          </h3>
          <p className="description">
            At <a href="https://algolia.com">Algolia</a>, I create technologies
            to help humans find things, get <a href="https://algolia.com/products/recommendations">inspired</a>, and <a href="https://www.algolia.com/blog/ai/launching-an-industry-leading-artificially-intelligent-search-platform/">be understood</a>.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/parvagues/">
            <h3>
              …code into <em>music</em>
            </h3>
          </Link>
          <p className="description">
            As <Link href="/parvagues/">ParVagues</Link>, I write patterns that
            shape soundwaves.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/hydra/">
            <h3>
              …code into <em>animated pixelscapes</em>
            </h3>
          </Link>
          <p className="description">
            Using <Link href="/hydra/">Hydra</Link>, I create animations that
            offer windows into other worlds.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/talks/">
            <h3>
              …ideas into <em>talks</em>
            </h3>
          </Link>
          <p className="description">
            I <Link href="/talks/">speak</Link> about topics I care about: from
            sharing my passions and teaching useful patterns, to questioning our
            current mental models.
          </p>
          <h5 className={utilStyles.headingLg}>Most recent talks</h5>
          <ul className={utilStyles.list}>
            {talks.map(({ id, title, description }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/talks#${id}`}>
                  <h4>{title}</h4>
                </Link>
                {description && (
                  <small className={utilStyles.lightText}>{description}</small>
                )}
                <br />
              </li>
            ))}
          </ul>
        </section>
        {/* TODO: Get rid of blog or use it :') */}
        {/* <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>Blog</h2>
          <ul className={utilStyles.list}>
            {posts.map(({ id, date, title }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/post/${id}`}>
                  <a>{title}</a>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </li>
            ))}
          </ul>
        </section> */}
      </Layout>
    </div>
  );
}
