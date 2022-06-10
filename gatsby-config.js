module.exports = {
  siteMetadata: {
    title: 'React Responsive Slider',
    siteUrl: 'https://krtac.github.io/react-responsive-slider/'
  },
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