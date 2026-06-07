'use client';

import Image from "next/image";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const name = "PLN";
export const siteTitle = "PLN's Works";
export const siteURL = "https://me.nech.pl";
export const twitterHandle = "@PaulLouisNech";
export const description = "PLN's Selected Works";

export default function Layout({ children, home }) {
  const router = useRouter();
  return (
    <div className={`site-shell ${styles.container}`}>
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
          <div onClick={() => router.back()} className={utilStyles.backButton}>
            Go Back
          </div>
        </div>
      )}
      <footer>
        PLN {new Date().getFullYear()} | ☇
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
