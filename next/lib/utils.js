import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { remark } from 'remark';
import remarkHtml from 'remark-html';

function getContentDirectory(name) {
  return path.join(process.cwd(), "content", name);
}

// Helper function to check if a file is a markdown file
function isMarkdownFile(fileName) {
  return fileName.endsWith('.md') && !fileName.endsWith('.mdx.md');
}

// Helper function to get ID from filename
function getIdFromFileName(fileName) {
  return fileName.replace(/\.md$/, '');
}

function getAllContentData(name, sorted = false) {
  // Get file names under /content/{name}
  const contentDirectory = getContentDirectory(name);
  const fileNames = fs.readdirSync(contentDirectory);
  console.log(`getAllContentData: Found ${fileNames.length} files in ${name}`);
  
  const allContentData = fileNames
    .filter(isMarkdownFile)
    .map((fileName) => {
      const id = getIdFromFileName(fileName);
      console.log(`Processing ${fileName} with id ${id}`);

      // Read markdown file as string
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the id
      return {
        id,
        ...matterResult.data,
      };
    });

  return sorted
    ? allContentData.sort((a, b) => {
        if (a.date < b.date) {
          return 1;
        } else {
          return -1;
        }
      })
    : allContentData;
}

function getAllContentIds(name) {
  const fileNames = fs.readdirSync(getContentDirectory(name));
  console.log(`getAllContentIds: Found ${fileNames.length} files in ${name}`);

  return fileNames
    .filter(isMarkdownFile)
    .map((fileName) => ({
      params: {
        id: getIdFromFileName(fileName),
      },
    }));
}

async function getContentData(name, id) {
  // Ensure we're looking for a .md file
  const fileName = `${id}${id.endsWith('.md') ? '' : '.md'}`;
  const fullPath = path.join(getContentDirectory(name), fileName);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    throw new Error(`No content found for ${id}`);
  }

  console.log("Reading content from:", fullPath);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkHtml)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  if ("description" in matterResult.data) {
    const processedDescription = await remark()
      .use(remarkHtml)
      .process(matterResult.data.description);
    matterResult.data.description = processedDescription.toString();
  }

  // Combine the data with the id and contentHtml
  return {
    id: getIdFromFileName(fileName),
    contentHtml,
    ...matterResult.data,
  };
}

export {
  getContentDirectory,
  getContentData,
  getAllContentData,
  getAllContentIds,
};
