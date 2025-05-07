import Head from "next/head";
import Link from "next/link";
import Date from "../components/date";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getPostsData } from "../lib/posts";
import { getRecentTalksData } from "../lib/talks";
import HoverTooltip from "@/components/HoverTooltip";

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
          <h1 className="title">Bonjour !</h1>
          <h2>
            I'm PLN, and I love to <i>transform…</i>
          </h2>

          <h3>
            …code into <em>solutions to human problems</em>
          </h3><br />
          <p className="description">
            At <a href="https://algolia.com">Algolia</a>, I've crafted tools that help you{" "}
            <HoverTooltip 
              content="From 2016 to 2018, I built tools to accelerate Android developers crafting unique search experiences."
              links={[
                { 
                  text: "Crafted the first Algolia Mobile Search Toolkit, InstantSearch-Android", 
                  url: "https://github.com/algolia/instantsearch-android" 
                },
                { 
                  text: "Built the Voice-Overlay, an open-source voice input and STT helper", 
                  url: "https://github.com/algolia/voice-overlay-android" 
                }
              ]}
            >
                build mobile apps
            </HoverTooltip>,{" "}
            <HoverTooltip 
              content="From 2019 to 2021, I built tools to better understand search users and give them semantic answers:
              Algolia Understand was a cross-index Intent Detection and Entity Recognition API, and Algolia Answers was a Question Answering API with Semantic Reranking using early Transformer models & Smart Highlighting with QA models."
              links={[
                { 
                  text: "Algolia Understand", 
                  url: "https://www.algolia.com/blog/ai/launching-an-industry-leading-artificially-intelligent-search-platform/"
                }
              ]}
            >
              understand your users
            </HoverTooltip>, and {" "}
            <HoverTooltip 
              content="From 2022 to 2024, I worked on Recommendation APIs - serving at high-scale (billions of items per months) a blend of algorithms to recommend content by learning from either user behavior, semantic image analysis, or textual analysis."
              links={[
                { 
                  text: "LookingSimilar", 
                  url: "https://www.algolia.com/about/news/algolia-unveils-new-looking-similar-capability-elevating-shopping-experiences-with-image-based-recommendations"
                }
              ]}
            >
              show them your world
            </HoverTooltip>.<br />
            Nowadays, i create GenAI tools for{" "}
            <HoverTooltip 
              content="Blending state-of-the-art LLMs with world-class search engines to create next-generation AI experiences."
              links={[
                { 
                  text: "Generative Experiences", 
                  url: "https://www.algolia.com/products/ai-search/"
                }
              ]}
            >
              builders of unique experiences
            </HoverTooltip><br />{" "}
            that blend the best of search and AI.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/parvagues/" className={utilStyles.sectionLink}>
            <span>…code into <em>music</em></span>
          </Link>
          <p className="description">
            As <Link href="/parvagues/" className={utilStyles.inlineLink}>ParVagues</Link>, I write patterns that
            shape soundwaves.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/hydra/" className={utilStyles.sectionLink}>
            <span>…code into <em>animated pixelscapes</em></span>
          </Link>
          <p className="description">
            Using <Link href="/hydra/" className={utilStyles.inlineLink}>Hydra</Link>, I create animations that
            offer windows into other worlds.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/poesie/" className={utilStyles.sectionLink}>
            <span>…words into <em>poems</em></span>
          </Link>
          <p className="description">
            A selection of texts scattered across note books and note apps.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/talks/" className={utilStyles.sectionLink}>
            <span>…ideas into <em>talks</em></span>
          </Link>
          <p className="description">
            I <Link href="/talks/" className={utilStyles.inlineLink}>speak</Link> about topics I care about: from
            sharing my passions and teaching useful patterns, to questioning our
            current mental models.
          </p>
          <hr />
          <h6 className={utilStyles.headingLg}>Most recent talks</h6>
          <ul className={utilStyles.list}>
            {talks.map(({ id, title, description }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/talks#${id}`} className={utilStyles.listItemLink}>
                  <span>{title}</span>
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
