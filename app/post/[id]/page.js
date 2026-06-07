import Layout from "@/components/layout";
import Date from "@/components/date";
import utilStyles from "@/styles/utils.module.css";
import { getAllPostIds, getPostData } from "@/lib/posts";

export function generateStaticParams() {
  return getAllPostIds().map(({ params }) => params);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const postData = await getPostData(id);
  return { title: postData.title };
}

export default async function Post({ params }) {
  const { id } = await params;
  const postData = await getPostData(id);

  return (
    <Layout>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  );
}
