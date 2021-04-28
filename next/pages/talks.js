import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { getTalksData } from "../lib/talks";

import React from "react";
import ReactPlayer from "react-player";

export async function getStaticProps() {
  const talks = getTalksData();
  const selection = [];

  return {
    props: {
      talks,
      selection,
    },
  };
}

export default function Talks({ talks, selection }) {
  return (
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Talks</title>
      </Head>
      <div>
        <section className={utilStyles.headingMd}>
          <h1>I speak about topics I love</h1>
          <ul>
            {selection.map(({}) => (
              <li>
                <h3>Item</h3>
              </li>
            ))}
          </ul>
        </section>

        <ul className={utilStyles.list}>
          {talks.map(
            ({
              id,
              title,
              description,
              date,
              org,
              context,
              video,
              slides,
              event,
            }) => (
              <Link href={`/talks#${id}`} key={id}>
                <li className={utilStyles.listItem}>
                  <h3 id={id}>{title}</h3>
                  {description && (
                    <>
                      <small>{description}</small>
                      <br />
                    </>
                  )}
                  <small className={utilStyles.lightText}>
                    <Date dateString={date} />
                    {context && (
                      <p>
                        {" "}
                        <i>
                          at <a href={event}>{context}</a>{" "}
                          {org && <>organised by {org}</>}
                        </i>
                      </p>
                    )}
                  </small>{" "}
                  <ul className="links">
                    {video && (
                      <li>
                        <a href={video}>Video</a>
                      </li>
                    )}
                    {slides && (
                      <li>
                        <a href={slides}>Slides</a>
                      </li>
                    )}
                    {event && (
                      <li>
                        <a href={event}>Event</a>
                      </li>
                    )}
                  </ul>
                </li>
              </Link>
            )
          )}
        </ul>
      </div>
    </Layout>
  );
}
