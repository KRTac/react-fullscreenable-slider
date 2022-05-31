import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';


interface SliderProps {
  index?: number;
  children?: React.ReactNode;
}

const AutoSwipeableViews = autoPlay(SwipeableViews);

export default function Slider({ children, index: indexProp = undefined }: SliderProps) {
  return (
    <div>
      <AutoSwipeableViews
        index={0}
        onChangeIndex={() => {}}
        slideClassName=""
        enableMouseEvents
      >
        {children}
      </AutoSwipeableViews>
    </div>
  );
}
