const Nunjucks = require('nunjucks');
const glob = require('glob');
const fs = require('fs');

const projectIncludesPath = 'src/templates/_includes';
const projectLayoutPath = `${projectIncludesPath}/layouts`;
const defaultIncludesPath = 'node_modules/@cagov/11ty-build-system/defaults/_includes';
const defaultLayoutPath = `${defaultIncludesPath}/layouts`;

const environment = new Nunjucks.Environment(
  new Nunjucks.FileSystemLoader([
    projectIncludesPath,
    defaultIncludesPath,
    '.',
  ]),
  {
    autoescape: false,
  },
);

const forEachMissingLayout = (fn) => {
  const projectLayouts = glob.sync(`${projectLayoutPath}/**/*`, { nodir: true })
    .map(f => f.replace(`${projectLayoutPath}/`, ''));
  const defaultLayouts = glob.sync(`${defaultLayoutPath}/**/*`, { nodir: true })
    .map(f => f.replace(`${defaultLayoutPath}/`, ''));

  const missingLayouts = defaultLayouts.filter(file => !projectLayouts.includes(file));

  missingLayouts.forEach((file) => {
    const layoutInfo = {
      file,
      path: `../../../../${defaultLayoutPath}/${file}`,
      slug: file.replace('.njk', ''),
    };

    fn(layoutInfo);
  });
};

const addMissingTemplateFolders = () => {
  if (!fs.existsSync(projectIncludesPath)) {
    fs.mkdirSync(projectIncludesPath);
  }

  if (!fs.existsSync(projectLayoutPath)) {
    fs.mkdirSync(projectLayoutPath);
  }
};

const removeEmptyTemplateFolders = () => {
  try {
    fs.rmdirSync(projectLayoutPath);
    fs.rmdirSync(projectIncludesPath);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  environment,
  forEachMissingLayout,
  addMissingTemplateFolders,
  removeEmptyTemplateFolders,
};
