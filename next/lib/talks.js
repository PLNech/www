import {getAllContentData, getAllContentIds, getContentData} from './utils'

export function getTalksData() {
  return getAllContentData('talks', true)
}

export function getAllPostIds() {
  return getAllContentIds("talks")
}

export async function getPostData(id) {
  return getContentData("talks", id)
}
