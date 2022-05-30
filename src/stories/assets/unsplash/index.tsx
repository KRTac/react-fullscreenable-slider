import React from 'react';

import info from './info.json';


export function generateImgElements(): JSX.Element[] {
  const images: JSX.Element[] = [];

  for (const [ author, { small, big } ] of Object.entries(info)) {
    images.push(<img key={author} src={`/unsplash/${small}`} alt={`Photo by ${author}@unsplash.com`} data-fullscreen-src={`/unsplash/${big}`} />);
  }

  return images;
}
