const repoName = 'react-responsive-slider';

module.exports = {
  siteMetadata: {
    title: 'React Responsive Slider',
    siteUrl: `https://krtac.github.io/${repoName}/`
  },
  pathPrefix: `/${repoName}`,
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        'name': 'images',
        'path': './src/images/'
      }
    }
  ]
};