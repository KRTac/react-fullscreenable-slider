import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';

import { resolveClassName, noop } from '../utils';


export interface SliderClassNameStates {
  base?: string;
  fullscreen?: string;
}

export interface SliderClassNames {
  className?: string | SliderClassNameStates;
  slideClassName?: string | SliderClassNameStates;
  wrapperClassName?: string | SliderClassNameStates;
  previousBtnClassName?: string | SliderClassNameStates;
  nextBtnClassName?: string | SliderClassNameStates;
}

interface SliderProps extends SliderClassNames {
  isLightbox?: boolean;
  index?: number;
  children?: React.ReactNode;
  previousBtnLabel?: string;
  nextBtnLabel?: string;
}

const AutoSwipeableViews = autoPlay(SwipeableViews);

export default function Slider({
  isLightbox = false,
  children, index: indexProp = undefined,
  className, wrapperClassName, slideClassName,
  previousBtnClassName, nextBtnClassName,
  previousBtnLabel = 'Previous slide', nextBtnLabel = 'Next slide'
}: SliderProps) {
  return (
    <div className={resolveClassName(className, isLightbox)}>
      <AutoSwipeableViews
        index={indexProp || 0}
        onChangeIndex={() => {}}
        slideClassName={resolveClassName(slideClassName, isLightbox)}
        className={resolveClassName(wrapperClassName, isLightbox)}
        enableMouseEvents
      >
        {children}
      </AutoSwipeableViews>
      <span
        className={resolveClassName(previousBtnClassName, isLightbox)}
        onClick={noop}
        aria-label={previousBtnLabel}
        tabIndex={0}
        role="button"
        onKeyPress={noop}
      >
        
      </span>
      <span
        className={resolveClassName(nextBtnClassName, isLightbox)}
        onClick={noop}
        aria-label={nextBtnLabel}
        tabIndex={0}
        role="button"
        onKeyPress={noop}
      >
        
      </span>
    </div>
  );
}
