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
  const allTags = [...new Set(poems.flatMap(p => p.tags || []))];
  const tags = ['all', ...allTags];

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
        <title>Poems | Words into thoughts</title>
        <meta name="description" content="A collection of poems and thoughts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={utilStyles.headingMd}>
        <h1>Words into thoughts</h1>
        <p>A selection of texts scattered across note books and note apps.</p>
        
        <div className={utilStyles.filtersContainer}>
          <div className={utilStyles.filtersGroup}>
            <div className={utilStyles.filterItem}>
              <span className={utilStyles.filterLabel}>Sort by</span>
              <select 
                className={utilStyles.filterSelect}
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort poems by"
              >
                <option value="date">Date</option>
                <option value="wordcount">Word count</option>
              </select>
            </div>
            
            <div className={utilStyles.filterItem}>
              <span className={utilStyles.filterLabel}>Order</span>
              <select 
                className={utilStyles.filterSelect}
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="Sort order"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
            
            <div className={utilStyles.filterItem}>
              <span className={utilStyles.filterLabel}>Language</span>
              <select 
                className={utilStyles.filterSelect}
                value={filterLanguage} 
                onChange={(e) => setFilterLanguage(e.target.value)}
                aria-label="Filter by language"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? 'All languages' : lang}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={utilStyles.filterItem}>
              <span className={utilStyles.filterLabel}>Tags</span>
              <select 
                className={utilStyles.filterSelect}
                value={filterTags} 
                onChange={(e) => setFilterTags(e.target.value)}
                aria-label="Filter by tag"
              >
                {tags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag === 'all' ? 'All tags' : tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={utilStyles.list}>
          {sortedPoems.length === 0 ? (
            <p>No poems match your current filters. Try adjusting your selection.</p>
          ) : (
            sortedPoems.map(({ id, title, date, language, tags }) => (
              <div className={utilStyles.poemCard} key={id}>
                <Link href={`/poesie/${id}`} className={utilStyles.listItemLink}>
                  {title}
                </Link>
                
                <div className={utilStyles.poemMeta}>
                  {date && (
                    <span className={utilStyles.poemMetaItem}>
                      <Date dateString={date} />
                    </span>
                  )}
                  
                  {language && (
                    <span className={utilStyles.poemMetaItem}>
                      {language}
                    </span>
                  )}
                </div>
                
                {tags && tags.length > 0 && (
                  <div className={utilStyles.tagList}>
                    {tags.map(tag => (
                      <span key={tag} className={utilStyles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
} 