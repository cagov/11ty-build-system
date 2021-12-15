const changeDomain = (url, domain) => {
  try {
    const u = new URL(url, `https://${domain}`);
    u.host = domain;
    return u.href;
  } catch {
    return url;
  }
};

module.exports = {
  changeDomain,
};
