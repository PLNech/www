import { useState, useEffect } from 'react';
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
  const [sortBy, setSortBy] = useState('tier');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterLanguage, setFilterLanguage] = useState('Français');
  const [filterTags, setFilterTags] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedPoems, setDisplayedPoems] = useState([]);

  // Get unique languages and tags
  const languages = ['all', ...new Set(poems.map(p => p.language || 'unknown'))];
  const allTags = [...new Set(poems.flatMap(p => p.tags || []))];
  const tags = ['all', ...allTags];

  // Filter and sort poems whenever filters change
  useEffect(() => {
    // Filter poems based on all criteria
    const filtered = poems
      .filter(p => filterLanguage === 'all' || p.language === filterLanguage)
      .filter(p => filterTags === 'all' || (p.tags && p.tags.includes(filterTags)))
      .filter(p => {
        if (!searchTerm) return true;
        
        const search = searchTerm.toLowerCase();
        const titleMatch = p.title?.toLowerCase().includes(search);
        const tagsMatch = p.tags?.some(tag => tag.toLowerCase().includes(search));
        
        return titleMatch || tagsMatch;
      });

    // Sort filtered poems
    const sorted = [...filtered].sort((a, b) => {
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

    setDisplayedPoems(sorted);
  }, [poems, sortBy, sortOrder, filterLanguage, filterTags, searchTerm]);

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
        
        <div className={utilStyles.searchContainer}>
          {/* Search bar */}
          <input
            type="text"
            className={utilStyles.searchBar}
            placeholder="Title or tag(s)  "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search poems"
          />
          
          {/* Compact filter dropdowns */}
          <div className={utilStyles.filterDropdowns}>
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
            
            <select 
              className={utilStyles.filterSelect}
              value={`${sortBy}-${sortOrder}`} 
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              aria-label="Sort options"
            >
              <option value="tier-desc">Best first</option>
              <option value="tier-asc">Worst first</option>
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
              <option value="wordcount-desc">Longest first</option>
              <option value="wordcount-asc">Shortest first</option>
            </select>
          </div>
        </div>

        <div className={utilStyles.list}>
          {displayedPoems.length === 0 ? (
            <p>No poems match your current filters. Try adjusting your selection.</p>
          ) : (
            displayedPoems.map(({ id, title, date, language, tags }) => (
              <div className={utilStyles.poemCard} key={id}>
                <Link 
                  href={`/poesie/${id}`} 
                  className={utilStyles.listItemLink}
                >
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