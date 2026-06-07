import {getAllContentData, getAllContentIds, getContentData} from '@/lib/content'

export function getHydrasData() {
  return getAllContentData('hydras', true)
}

export function getAllHydraIds() {
  return getAllContentIds("hydras")
}

export async function getHydraData(id) {
  return getContentData("hydras", id)
}
