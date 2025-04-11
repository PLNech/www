import {getAllContentData, getAllContentIds, getContentData} from './utils'

export function getPoemsData(sortBy = 'date', sortOrder = 'desc') {
  const poems = getAllContentData('poems', false);
  
  // Default sort is by date
  let sortedPoems = [...poems].sort((a, b) => {
    if (a.date < b.date) return sortOrder === 'desc' ? 1 : -1;
    if (a.date > b.date) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  // Additional sorting options
  if (sortBy === 'wordcount') {
    sortedPoems.sort((a, b) => {
      const aWords = a.contentHtml?.split(/\s+/).length || 0;
      const bWords = b.contentHtml?.split(/\s+/).length || 0;
      return sortOrder === 'desc' ? bWords - aWords : aWords - bWords;
    });
  }

  return sortedPoems;
}

export function getAllPoemIds() {
  return getAllContentIds("poems");
}

export async function getPoemData(id) {
  return getContentData("poems", id);
} 