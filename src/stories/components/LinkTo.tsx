import React, { SyntheticEvent } from 'react';
import { NAVIGATE_URL } from '@storybook/core-events';
import { addons } from '@storybook/addons';


type LinkToProps = {
  children?: React.ReactNode;
  href?: string;
};

function LinkTo({ children, href }: LinkToProps) {
  let target = '_top';
  let handleClick: ((ev: SyntheticEvent) => void) | undefined = ev => {
    ev.preventDefault();

    addons.getChannel().emit(NAVIGATE_URL, href);
  };

  if (!href || href.match(/^(http|https)\:/)) {
    target = '_blank';
    handleClick = undefined;
  }

  return (
    <a
      target={target}
      href={href}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

export default LinkTo;
