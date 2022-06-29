import LinkTo from '../src/stories/components/LinkTo';
import '../src/stories/css/main.css';


export const parameters = {
  layout: 'centered',
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      order: [ 'Docs', ['Introduction', 'Getting started'] ]
    }
  },
  docs: {
    components: {
      div: 'div',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      p: 'p',
      a: LinkTo
    }
  }
};
