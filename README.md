# react-fullscreenable-slider

A swipeable image slider with integrated lightbox and fullscreen functionality.
Work in progress, not ready for production.

## Development

`react-swipeable-views` currently still doesn't list react 18 in it's deps, so
install react 17.

Install the peer dependencies with the `--no-save` flag:

```
npm install @react-hook/debounce react@^17 react-dom@^17 react-is react-modal react-swipeable-views react-swipeable-views-utils --no-save
```

And then the rest from `package.json` and run storybook:

```
npm install
npm run storybook
```

### Build

```
npm run rollup
```
