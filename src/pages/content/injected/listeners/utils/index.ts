export const matchURL = (url) => {
  if (["<all_urls>", "*"].includes(url)) {
    return true;
  }
  return location.host === url.toLowerCase();
};

const contentSelectors = [
  { regex: /^https:\/\/www.google.com\/search.*/, selector: "#rcnt" },
  {
    regex: /^https:\/\/stackoverflow.com\/questions\/.*/,
    selector: "#mainbar",
  },
];

export const getContentSelector = (url) => {
  for (const { regex, selector } of contentSelectors) {
    if (regex.test(url)) {
      return selector;
    }
  }
  return "body";
};
