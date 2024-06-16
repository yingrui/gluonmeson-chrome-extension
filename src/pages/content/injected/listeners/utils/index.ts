export const matchURL = (url) => {
  if (["<all_urls>", "*"].includes(url)) {
    return true;
  }
  return location.host === url.toLowerCase();
};

const selectors = [
  {
    regex: /^https:\/\/www.google.com\/search.*/,
    contentSelector: "#rcnt",
    linkSelector: 'a:visible[jsname="UWckNb"]',
  },
  {
    regex: /^https:\/\/stackoverflow.com\/questions\/.*/,
    contentSelector: "#mainbar",
  },
];

export const getSelectorSettings = (url) => {
  for (const selector of selectors) {
    if (selector.regex.test(url)) {
      return selector;
    }
  }
  return { regex: "*", contentSelector: "body" };
};
