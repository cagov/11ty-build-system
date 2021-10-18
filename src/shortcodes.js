const includeCSSUnlessDev = (content, devFilePath) => {
  if (process.env.NODE_ENV === 'development') {
    return `<link rel="stylesheet" type="text/css" href="${devFilePath}">`;
  }
  return content;
};

const includeJSUnlessDev = (content, devFilePath) => {
  if (process.env.NODE_ENV === 'development') {
    return `<script type="module" src="${devFilePath}"></script>`;
  }
  return content;
};

module.exports = {
  includeCSSUnlessDev,
  includeJSUnlessDev,
};
