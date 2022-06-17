module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-postcss"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  },
  "staticDirs": [ "../src/stories/assets" ],
  "features": {
    "postcss": false
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
};
