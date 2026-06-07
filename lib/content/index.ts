import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

/**
 * Unified content loader.
 *
 * Two collection shapes live here, on purpose — not one forced shape:
 *  - flat Markdown collections (posts, poems, talks, hydras): one .md per item
 *    under content/<section>/, frontmatter + rendered HTML body;
 *  - ParVagues "lives": a richer, year-foldered gig collection with optional
 *    tracks.json and gig-photo folders.
 *
 * Thin section wrappers (lib/posts.js, lib/hydras.js, …) bind a section name to
 * the flat API; the ParVagues pages call the lives API directly.
 */

const CONTENT_ROOT = path.join(process.cwd(), 'content');

/* ------------------------------------------------------------------ *
 * Flat Markdown collections — content/<section>/<id>.md
 * ------------------------------------------------------------------ */

function sectionDir(section: string) {
  return path.join(CONTENT_ROOT, section);
}

function isMarkdownFile(fileName: string) {
  return fileName.endsWith('.md') && !fileName.endsWith('.mdx.md');
}

function idFromFileName(fileName: string) {
  return fileName.replace(/\.md$/, '');
}

async function renderMarkdown(md: string) {
  const processed = await remark().use(remarkHtml).process(md);
  return processed.toString();
}

export function getContentDirectory(section: string) {
  return sectionDir(section);
}

/** Frontmatter-only listing (used by index/listing pages). */
export function getAllContentData(section: string, sorted = false) {
  const dir = sectionDir(section);
  const entries = fs
    .readdirSync(dir)
    .filter(isMarkdownFile)
    .map((fileName) => {
      const { data } = matter(fs.readFileSync(path.join(dir, fileName), 'utf8'));
      return { id: idFromFileName(fileName), ...data };
    });

  return sorted ? entries.sort((a, b) => (a.date < b.date ? 1 : -1)) : entries;
}

/** Plain id list. App Router callers map it to params: ids.map((id) => ({ id })). */
export function getAllContentIds(section: string): string[] {
  return fs.readdirSync(sectionDir(section)).filter(isMarkdownFile).map(idFromFileName);
}

/** Single item with rendered HTML body (and HTML-rendered description, if any). */
export async function getContentData(section: string, id: string) {
  const fileName = id.endsWith('.md') ? id : `${id}.md`;
  const fullPath = path.join(sectionDir(section), fileName);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`No content found for ${section}/${id}`);
  }

  const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));
  const contentHtml = await renderMarkdown(content);

  if (typeof data.description === 'string') {
    data.description = await renderMarkdown(data.description);
  }

  return { id: idFromFileName(fileName), contentHtml, ...data };
}

/* ------------------------------------------------------------------ *
 * ParVagues lives — content/lives/<year>/<slug>.md
 *   + optional content/lives/<year>/<slug>/tracks.json
 *   + gig photos under public/images/parvagues/lives/<year>/<slug>/
 * ------------------------------------------------------------------ */

const LIVES_ROOT = path.join(CONTENT_ROOT, 'lives');

function liveYears(): string[] {
  return fs
    .readdirSync(LIVES_ROOT)
    .filter((item) => fs.statSync(path.join(LIVES_ROOT, item)).isDirectory());
}

/** All gigs across every year folder, newest-first. */
export function getAllLives() {
  const lives: any[] = [];
  for (const year of liveYears()) {
    const yearPath = path.join(LIVES_ROOT, year);
    for (const fileName of fs.readdirSync(yearPath)) {
      if (!fileName.endsWith('.md')) continue;
      const slug = fileName.replace(/\.md$/, '');
      const { data } = matter(fs.readFileSync(path.join(yearPath, fileName), 'utf8'));
      lives.push({ slug, year, ...data });
    }
  }
  return lives.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getLiveData(slug: string) {
  for (const year of liveYears()) {
    const filePath = path.join(LIVES_ROOT, year, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const { data, content } = matter(fs.readFileSync(filePath, 'utf8'));
      return { slug, year, frontmatter: data, content };
    }
  }
  throw new Error(`Live with slug "${slug}" not found`);
}

export function getLiveTracks(slug: string) {
  for (const year of liveYears()) {
    const tracksPath = path.join(LIVES_ROOT, year, slug, 'tracks.json');
    if (fs.existsSync(tracksPath)) {
      return JSON.parse(fs.readFileSync(tracksPath, 'utf8'));
    }
  }
  return null;
}

export function getLivesImages(slug: string): string[] {
  for (const year of liveYears()) {
    const imagesPath = path.join(process.cwd(), 'public/images/parvagues/lives', year, slug);
    if (fs.existsSync(imagesPath)) {
      return fs
        .readdirSync(imagesPath)
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => `/images/parvagues/lives/${year}/${slug}/${file}`);
    }
  }
  return [];
}
