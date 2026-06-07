import Layout from "@/components/layout";
import Date from "@/components/date";
import utilStyles from "@/styles/utils.module.css";
import { getTalksData } from "@/lib/talks";

export const metadata = {
  title: "Talks",
};

export default function Talks() {
  const talks = getTalksData();

  return (
    <Layout>
      <div>
        <section className={utilStyles.headingMd}>
          <h1>I speak about topics I love</h1>
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
              audio,
              video,
              slides,
              event,
            }) => (
              <li className={utilStyles.listItem} key={id}>
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
                    <i> at <a href={event}>{context}</a>{" "}
                      {org && <>organised by {org}</>}
                    </i>
                  )}
                </small>{" "}
                <ul className="links">
                  {video && (
                    <li>
                      <a href={video}>Video</a>
                    </li>
                  )}
                  {audio && (
                    <li>
                      <a href={audio}>Audio</a>
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
            )
          )}
        </ul>
      </div>
    </Layout>
  );
}
