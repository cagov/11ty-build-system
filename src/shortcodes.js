const includeCSSUnlessDev = (content, devFilePath) => {
    if (process.env.NODE_ENV === 'development') {
        return `<link rel="stylesheet" type="text/css" href="${devFilePath}">`;
    } else {
        return content;
    }
}

const includeJSUnlessDev = (content, devFilePath) => {
    if (process.env.NODE_ENV === 'development') {
        return `<script type="module" src="${devFilePath}"></script>`;
    } else {
        return content;
    }
}

module.exports = {
    includeCSSUnlessDev,
    includeJSUnlessDev
}