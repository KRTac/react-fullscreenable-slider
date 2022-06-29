const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/stories/**/*.{tsx,mdx}',
    './.storybook/preview.js'
  ],
  theme: {
    fontFamily: {
      sans: [ '\'Open Sans\'', ...defaultTheme.fontFamily.sans ],
      mono: [ '\'Source Code Pro\'', ...defaultTheme.fontFamily.serif ]
    },
    extend: {}
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};
