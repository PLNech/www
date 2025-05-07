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
              content={
                <>
                  From <strong>2016</strong> to <strong>2018</strong>,<br /> 
                  I built tools to <strong>accelerate Android developers</strong> crafting unique search experiences.
                </>
              }
              links={[
                { 
                  text: "InstantSearch-Android, the first Algolia Mobile Search Toolkit", 
                  url: "https://github.com/algolia/instantsearch-android" 
                },
                { 
                  text: "Voice-Overlay, an open-source speech-to-text helper", 
                  url: "https://github.com/algolia/voice-overlay-android" 
                }
              ]}
            >
                build mobile apps
            </HoverTooltip>,{" "}
            <HoverTooltip 
              content={
                <>
                  From <strong>2019</strong> to <strong>2021</strong>,<br /> 
                  I built APIs to better <strong>understand user language</strong> in search engines and give them semantic answers.
                  <br /><br />
                  <strong>Algolia Understand</strong> was a cross-index Intent Detection and Entity Recognition API.
                  <br /><br />
                  <strong>Algolia Answers</strong> was a Question Answering API with Semantic Reranking using early Transformer models & Smart Highlighting with QA models.
                </>
              }
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
              content={
                <>
                  From <strong>2022</strong> to <strong>2024</strong>,<br /> 
                  I worked on <strong>Recommendation APIs</strong> - serving at high-scale (<i>billions</i><br /> of items per months) a blend of algorithms to recommend content by learning from either <i>user behavior</i>, <i>semantic image analysis</i>, or <i>textual analysis</i>.
                  <br /><br />
                  <strong>LookingSimilar</strong> is the visual recommendation API I built over Algolia's NeuralHash engine, 
                  leveraging open-source image vectorization models and HNSW graphs to recommend visually relevant items.
                </>
              }
              links={[
                { 
                  text: "LookingSimilar", 
                  url: "https://www.algolia.com/about/news/algolia-unveils-new-looking-similar-capability-elevating-shopping-experiences-with-image-based-recommendations"
                }
              ]}
            >
              show them your world
            </HoverTooltip>.<br />
            Nowadays, I create GenAI tools for{" "}
            <HoverTooltip 
              content="Blending state-of-the-art LLMs with a distributed search engine to create a new kind of content discovery experiences."
              links={[
                { 
                  text: "Generative Experiences", 
                  url: "https://www.algolia.com/about/news/revolutionizing-retail-algolia-unveils-groundbreaking-generative-ai-for-shopping-experiences"
                }
              ]}
            >
              builders of generative experiences
            </HoverTooltip><br />{" "}
            that blend the best of search and language understanding.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/parvagues/" className={utilStyles.sectionLink}>
            <span>…code into <em>music</em></span>
          </Link>
          <p className="description">
            As <Link href="/parvagues/" className={utilStyles.inlineLink}>ParVagues</Link>, I write patterns that
            shape soundwaves. <br />
            I share those as <Link href="https://song.link/i/1773790994" target="_blank" className={utilStyles.inlineLink}>tracks</Link>, <Link href="https://archive.org/details/toplap-solstice-dec2024-parvagues" target="_blank" className={utilStyles.inlineLink}>videos</Link>, and <Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" className={utilStyles.inlineLink}>live performances</Link>.
          </p>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <Link href="/hydra/" className={utilStyles.sectionLink}>
            <span>…code into <em>animated pixelscapes</em></span>
          </Link>
          <p className="description">
            Using <Link href="/hydra/" className={utilStyles.inlineLink}>Hydra</Link>, I create animations that
            offer{" "}
            <HoverTooltip 
              content={
                <>
                  <img src="/images/halley.png" alt="Hydra" />
                  <br />
                  With <Link href="https://github.com/ojack/hydra" target="_blank" className={utilStyles.inlineLink}>Olivia Jack's Hydra.js</Link>, I create interactive or slowly morphing pixelscapes.
                </>
              }
            >
              windows into other worlds
            </HoverTooltip>.
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
