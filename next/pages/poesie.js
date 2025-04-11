import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/layout';
import Date from '../components/date';
import utilStyles from '../styles/utils.module.css';
import { getPoemsData } from '../lib/poems';

export async function getStaticProps() {
  const poems = getPoemsData();
  return {
    props: {
      poems,
    },
  };
}

export default function Poems({ poems }) {
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterTags, setFilterTags] = useState('all');

  // Get unique languages and tags
  const languages = ['all', ...new Set(poems.map(p => p.language || 'unknown'))];
  const tags = ['all', ...new Set(poems.flatMap(p => p.tags || []))];

  // Filter and sort poems
  const filteredPoems = poems
    .filter(p => filterLanguage === 'all' || p.language === filterLanguage)
    .filter(p => filterTags === 'all' || (p.tags && p.tags.includes(filterTags)));

  const sortedPoems = [...filteredPoems].sort((a, b) => {
    if (sortBy === 'date') {
      if (a.date < b.date) return sortOrder === 'desc' ? 1 : -1;
      if (a.date > b.date) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    }
    if (sortBy === 'wordcount') {
      const aWords = a.contentHtml?.split(/\s+/).length || 0;
      const bWords = b.contentHtml?.split(/\s+/).length || 0;
      return sortOrder === 'desc' ? bWords - aWords : aWords - bWords;
    }
    return 0;
  });

  return (
    <Layout>
      <Head>
        <title>Poems</title>
      </Head>
      <div className={utilStyles.headingMd}>
        <h1>Words into thoughts</h1>
        
        <div className={utilStyles.filters}>
          <div>
            <label>Sort by: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="wordcount">Word count</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          
          <div>
            <label>Language: </label>
            <select value={filterLanguage} onChange={(e) => setFilterLanguage(e.target.value)}>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Tag: </label>
            <select value={filterTags} onChange={(e) => setFilterTags(e.target.value)}>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        <ul className={utilStyles.list}>
          {sortedPoems.map(({ id, title, date, language, tags }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/poesie/${id}`} className={utilStyles.listItemLink}>
                {title}
              </Link>
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
                {language && ` • ${language}`}
                {tags && tags.length > 0 && ` • ${tags.join(', ')}`}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
} 