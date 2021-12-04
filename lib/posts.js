import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // Getfile names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {
    // remove ".md" from file name and handle it as id
    const id = fileName.replace(/\.md$/, '');

    // read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // use gra-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // combine data with id
    return {
      id,
      ...matterResult.data
    };
  })

  // sort posts by date
  return allPostsData.sort(({ date: a}, { date: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    };
  });
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // use gra-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // use remark to convert markdown into html string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // combine data with id
  return {
    id,
    contentHtml,
    ...matterResult.data
  };
}