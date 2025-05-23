import Head from "next/head";
import Image from "next/image";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Router from 'next/router'

const name = "PLN";
export const siteTitle = "PLN's Works";
export const siteURL = "https://me.plnech.fr";
export const twitterHandle = "@PaulLouisNech";
export const description = "PLN's Selected Works";

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <script src="http://localhost:8097"></script>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={description} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content={twitterHandle} key="twhandle" />
        {/* Open Graph */}
        <meta name="og:title" content={siteTitle} key="ogtitle"/>
        <meta property="og:url" content={siteURL} key="ogurl" />
        <meta property="og:site_name" content={siteTitle} key="ogsitename" />
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:description" content={description} key="ogdesc" />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=dark&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
      </Head>
      <header className={styles.header}>
        {home ? (
          <>
            <Image
              priority
              src="/images/profile.png"
              className={utilStyles.borderCircle}
              height={144}
              width={144}
              alt={name}
            />
            <h1 className={utilStyles.heading2Xl}>{name}</h1>
          </>
        ) : (
          <>
            <Link href="/">

              <Image
                priority
                src="/images/profile.png"
                className={utilStyles.borderCircle}
                height={108}
                width={108}
                alt={name}
              />

            </Link>
            <h2 className={utilStyles.headingLg}>
              <Link href="/" className={utilStyles.colorInherit}>
                {name}
              </Link>
            </h2>
          </>
        )}
      </header>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <div onClick={() => Router.back()} className={utilStyles.backButton}>
            Go Back
          </div>
        </div>
      )}
      <footer>
        PLN 2024 | ☇
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          ▲
        </a>
      </footer>
    </div>
  );
}
