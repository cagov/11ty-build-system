# CaGov's 11ty Build System

Adds CSS, Javascript, and other pre-processing powers to your [11ty](https://11ty.dev) build. 

No need to worry about setting up long, multi-step npm scripts. Say goodbye to task runners. Let go of your attachment to bespoke watchers. We'll take care of the details.

🚧 Work in progress! Use at your peril! 🚧

## Installation 

First, install this plugin into your 11ty project.

```sh
npm install @cagov/11ty-build-system
```

Next, drop the plugin into your [`.eleventy.js`](https://www.11ty.dev/docs/config/) file.

```js
const cagovBuildSystem = require('@cagov/11ty-build-system');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(cagovBuildSystem, {
    // Your buildConfig options go here, see below.
  });

  // ...the rest of your project's 11ty config code...
};
```

TL;DR: here's a full example of the plugin's options.

```js
const cagovBuildSystem = require('@cagov/11ty-build-system');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(cagovBuildSystem, {
    postcss: {
      file: 'src/css/postcss.config.js',
      watch: ['src/css/**/*']
    },
    rollup: {
      file: 'src/js/rollup.config.js',
      watch: ['src/js/**/*']
    },
    beforeBuild: () => {
      // Download files, check APIs, etc.
    }
  });

  // ...the rest of your project's 11ty config code...
};
```

## PostCSS Configuration

For your CSS needs, this plugin picks up [PostCSS](https://postcss.org/) files.

The following example will process a single `postcss.config.js` file in the `src/css` folder of your project.

```js
eleventyConfig.addPlugin(cagovBuildSystem, {
  postcss: {
    file: 'src/css/postcss.config.js',
    watch: ['src/css/**/*']
  }
});
```

If needed, you may process multiple PostCSS config files. Just supply an array of configurations.

```js
eleventyConfig.addPlugin(cagovBuildSystem, {
  postcss: [
    {
      file: 'src/css/postcss.home.config.js',
      watch: ['src/css/home/**/*']
    },
    {
      file: 'src/css/postcss.page.config.js',
      watch: [
        'src/css/page/**/*',
        'src/css/page-widget/**/*'
      ]
    }
  ]
});
```

Each PostCSS configuration supplied to the plugin accepts the following options.

|Name|Description|
|:--:|:----------|
|**`file`**|Path to the `postcss.config.js' file.|
|**`watch`**|An array of [glob expressions](https://github.com/isaacs/minimatch) to watch for changes within 11ty's [serve](https://www.11ty.dev/docs/watch-serve/) mode.|

### PostCSS Files

Here's an example `postcss.config.js` file for use alongside the above PostCSS configuration.

```js
const postcssSass = require('@csstools/postcss-sass');

module.exports = {
  to: 'docs/css/build/styles.css',
  from: 'src/css/_index.scss',
  plugins: [
    postcssSass({ includePaths: [ '.src/css' ] })
  ]
};
```

PostCSS config files should include the following required fields.

|Name|Description|
|:--:|:----------|
|**`to`**|Path to the destination CSS file.|
|**`from`**|Path to the source CSS (or Sass) file.|
|**`plugins`**|An array of [PostCSS plugins](https://github.com/postcss/postcss/blob/main/docs/plugins.md).|

You may also set `map`, `parser`, `syntax`, and/or `stringifier` options as described in the [PostCSS docs](https://postcss.org/api/#resultoptions).

## Rollup Configuration

For Javascript processing, this plugin provides [Rollup](https://rollupjs.org/).

The following example will process a single `rollup.config.js` file.

```js
eleventyConfig.addPlugin(cagovBuildSystem, {
  rollup: {
    file: 'src/js/rollup.config.js',
    watch: ['src/js/**/*']
  }
});
```

Like PostCSS, you may specify multiple Rollup configurations in an array.

```js
eleventyConfig.addPlugin(cagovBuildSystem, {
  rollup: [
    {
      file: 'src/js/rollup.es5.config.js',
      watch: ['src/js/polyfills/**/*']
    },
    {
      file: 'src/js/rollup.all.config.js',
      watch: ['src/js/**/*']
    }
  ]
});
```

Note the options for Rollup configs.

|Name|Description|
|:--:|:----------|
|**`file`**|Path to the `rollup.config.js' file.|
|**`watch`**|An array of [glob expressions](https://github.com/isaacs/minimatch) to watch for changes within 11ty's [serve](https://www.11ty.dev/docs/watch-serve/) mode.|

### Rollup Files

Here's an example `rollup.config.js` file.

```js
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/js/index.js',
  output: {
    file: 'dist/js/bundle.js',
    format: 'esm'
  },
  plugins: [resolve(), terser()]
};
```

Check the [Rollup documentation](https://rollupjs.org/guide/en/#configuration-files) for more details.

## Run your own code

The plugin provides a `beforeBuild` callback function. You may use this to run any code before the 11ty build.

```js
eleventyConfig.addPlugin(cagovBuildSystem, {
  beforeBuild: () => {
    // Download files, check APIs, etc.
  },
});
```

## Order of operations

1. The `beforeBuild` callback runs first.
2. Next, `postcss` and `rollup` configurations run in parallel.
3. Finally, 11ty performs the rest of its usual build.

## Running the build

Because this is an 11ty plugin, no special `npm` scripts are needed. Just use [standard 11ty CLI commands](https://www.11ty.dev/docs/usage/).

```sh
# Build
eleventy

# Build in dev mode
NODE_ENV=development eleventy

# Serve and watch in dev mode
NODE_ENV=development eleventy --serve --incremental
```