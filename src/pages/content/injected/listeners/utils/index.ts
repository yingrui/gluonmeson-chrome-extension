export const matchURL = (url) => {
  if(['<all_urls>', '*'].includes(url)) {
    return true
  }
  return location.host === url.toLowerCase()
}
