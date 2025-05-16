import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const livesDirectory = path.join(process.cwd(), 'content/lives');

export function getAllLives() {
  const lives = [];
  
  // Read all years
  const years = fs.readdirSync(livesDirectory).filter(item => 
    fs.statSync(path.join(livesDirectory, item)).isDirectory()
  );
  
  years.forEach(year => {
    const yearPath = path.join(livesDirectory, year);
    const yearFiles = fs.readdirSync(yearPath);
    
    yearFiles.forEach(fileName => {
      if (fileName.endsWith('.md')) {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(yearPath, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        
        lives.push({
          slug,
          year,
          ...data,
        });
      }
    });
  });
  
  // Sort by date, most recent first
  return lives.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getLiveData(slug) {
  // Find the file across all year directories
  const years = fs.readdirSync(livesDirectory).filter(item => 
    fs.statSync(path.join(livesDirectory, item)).isDirectory()
  );
  
  for (const year of years) {
    const filePath = path.join(livesDirectory, year, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      return {
        slug,
        year,
        frontmatter: data,
        content,
      };
    }
  }
  
  throw new Error(`Live with slug "${slug}" not found`);
}

export function getLivesImages(slug) {
  const years = fs.readdirSync(livesDirectory).filter(item => 
    fs.statSync(path.join(livesDirectory, item)).isDirectory()
  );
  
  for (const year of years) {
    const imagesPath = path.join(process.cwd(), 'public/images/parvagues/lives', year, slug);
    if (fs.existsSync(imagesPath)) {
      const files = fs.readdirSync(imagesPath);
      return files
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => `/images/parvagues/lives/${year}/${slug}/${file}`);
    }
  }
  
  return [];
}
