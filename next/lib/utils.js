import path from "path";
import fs from "fs";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";

function getContentDirectory(name) {
  return path.join(process.cwd(), "content", name)
}

function getAllContentData(name, sorted = false) {
  // Get file names under /content/{name}
  const contentDirectory = getContentDirectory(name);
  const fileNames = fs.readdirSync(contentDirectory);
  console.log(`gACD: total ${name}(s): ${fileNames.length}`);

  const allContentData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

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
  console.log(`getAllContentIds: ${fileNames.length} ${name}(s).`);

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

async function getContentData(name, id) {
  const fullPath = path.join(getContentDirectory(name), `${id}.md`);
  console.log("Got content fullPath:", fullPath);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  console.log("Got contents:", fileContents);

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();
  console.log(matterResult);
  if ("description" in matterResult.data) {
    console.log("Got desc!");
    const processedDescription = await remark()
      .use(html)
      .process(matterResult.data.description);
    matterResult.data.description = processedContent.toString();

  }


  // Combine the data with the id and contentHtml
  return {
    id,
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
