import {getAllContentData, getAllContentIds, getContentData} from './utils'

export function getPostsData() {
  return getAllContentData('posts', true)
}

export function getAllPostIds() {
  return getAllContentIds("posts")
}

export async function getPostData(id) {
  return getContentData("posts", id)
}
