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
  const selection = [
  ];

  return {
    props: {
      talks,
      selection
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
          <h1>I give talks about topics I care about</h1>
          <h2></h2>
          <ul>
            {selection.map(({}) => (
              <li><h3>Item</h3></li>
            ))}
          </ul>
        </section>

        <h2 className={utilStyles.headingLg}>Most recent talks</h2>
        <ul className={utilStyles.list}>
          {talks.map(
            ({ id, date, title, org, context, video, slides, event }) => (
              <li className={utilStyles.listItem} key={id}>
                <a href={video || slides}>{title}</a>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                  {event && (
                    <p>
                      {" "}
                      at <a href={event}>{context}</a> by {org}
                    </p>
                  )}
                </small>{" "}
              </li>
            )
          )}
        </ul>
      </div>
    </Layout>
  );
}
