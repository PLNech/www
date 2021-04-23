import Head from "next/head";
import Link from "next/link";
import Date from "../components/date";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
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
            …code into <em>human solutions</em>
          </h3>
          <p className="description">
            At <a href="https://algolia.com">Algolia</a>, I create technologies to
            help humans find things and
            <a href="https://www.algolia.com/products/answers-for-support/">
              {" "}
              answers
            </a>
            .
          </p>

          <h3>
            …code into <em>music</em>
          </h3>
          <p className="description">
            As <Link href="/parvagues/">ParVagues</Link>, I write patterns that
            shape soundwaves.
          </p>

          <h3>
            …code into <em>animated pixelscapes</em>
          </h3>
          <p className="description">
            Using <Link href="/hydra/">Hydra</Link>, I create animations that
            offer windows into other words.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>Blog</h2>
          <ul className={utilStyles.list}>
            {allPostsData.map(({ id, date, title }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/posts/${id}`}>
                  <a>{title}</a>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </li>
            ))}
          </ul>
        </section>
      </Layout>
    </div>
  );
}
