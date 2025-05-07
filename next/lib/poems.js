import {getAllContentData, getAllContentIds, getContentData} from './utils'

export function getPoemsData(sortBy = 'tier', sortOrder = 'desc') {
  const poems = getAllContentData('poems', false);
  
  // Default sort is by DECREASING tier
  // Top is tier S, then A, then B, C, D, E, F, and finally tierless
  let sortedPoems = [...poems].sort((a, b) => {
    // Equal
    if (a.tier === b.tier) return 0;

    // Tierless
    if (a.tier === undefined) return sortOrder === 'desc' ? 1 : -1;
    if (b.tier === undefined) return sortOrder === 'desc' ? -1 : 1;
    // S is the best tier
    if (a.tier === 'S') return sortOrder === 'desc' ? -1 : 1;
    if (b.tier === 'S') return sortOrder === 'desc' ? 1 : -1;
    // A is the second best tier
    if (a.tier === 'A') return sortOrder === 'desc' ? -1 : 1;
    if (b.tier === 'A') return sortOrder === 'desc' ? 1 : -1;
    // B is the third best tier
    if (a.tier === 'B') return sortOrder === 'desc' ? -1 : 1;
    if (a.tier < b.tier) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  // Additional sorting options
  if (sortBy === 'date') {
    sortedPoems = [...poems].sort((a, b) => {
      if (a.tier < b.tier) return sortOrder === 'desc' ? 1 : -1;
      if (a.tier > b.tier) return sortOrder === 'desc' ? -1 : 1;
      return 0;
    });
  }
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


