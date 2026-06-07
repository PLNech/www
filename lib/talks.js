import {getAllContentData, getAllContentIds, getContentData} from './utils'

export function getTalksData() {
  return getAllContentData('talks', true)
}

export function getRecentTalksData() {
  return getAllContentData('talks', true).slice(0,3)
}

export function getAllTalkIds() {
  return getAllContentIds("talks")
}

export async function getTalkData(id) {
  return getContentData("talks", id)
}
