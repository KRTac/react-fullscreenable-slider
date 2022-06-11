import { useEffect } from 'react';
import useLayoutEffect from '@react-hook/passive-layout-effect';
import useResizeObserver from '@react-hook/resize-observer';
import { useThrottle } from '@react-hook/throttle';
import useLatest from '@react-hook/latest';

import { useAnimationTargets } from './';
import { inBrowser } from '../utils';


function useAxisDimensions(
  sliderRef: React.MutableRefObject<HTMLDivElement | null>,
  animationTargets: ReturnType<typeof useAnimationTargets>,
  itemsPerPageProp: string | number
): [ number, number, React.Dispatch<React.SetStateAction<number>> ] {
  const [ sliderDim, setSliderDim ] = useThrottle(0, 15, true);
  const [ itemDim, setItemDim ] = useThrottle(0, 15, true);

  const sizeIt = useLatest(() => {
    if (!sliderRef.current || !inBrowser) {
      return;
    }

    setSliderDim(sliderRef.current.getBoundingClientRect().width);

    if (
      itemsPerPageProp === 'auto' &&
      animationTargets.current.length > 0 &&
      animationTargets.current[0]
    ) {
      const parent = animationTargets.current[0].parentElement;

      if (parent) {
        const { marginLeft, marginRight } = window.getComputedStyle(parent);

        setItemDim(
          parent.getBoundingClientRect().width +
          parseFloat(marginLeft) +
          parseFloat(marginRight)
        );
      }
    }
  });

  const deps = [ sizeIt ];

  useLayoutEffect(sizeIt.current, deps);
  useResizeObserver(sliderRef, sizeIt.current);
  useEffect(() => {
    if (!inBrowser) {
      return;
    }

    function callback() {
      sizeIt.current();
    }

    window.addEventListener('resize', callback);
    window.addEventListener('orientationchange', callback);

    return () => {
      window.removeEventListener('resize', callback);
      window.removeEventListener('orientationchange', callback);
    };
  }, deps);

  return [ sliderDim, itemDim, setItemDim ];
}

export default useAxisDimensions;
