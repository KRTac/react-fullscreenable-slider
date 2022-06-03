import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';
import useResizeObserver from '@react-hook/resize-observer';
import { useDebounce } from '@react-hook/debounce';

import { resolveClassName, noop, preventEventDefault } from '../utils';


export interface SliderClassNameStates {
  base?: string;
  fullscreen?: string;
}

export interface SliderClassNames {
  className?: string | SliderClassNameStates;
  slideClassName?: string | SliderClassNameStates;
  activeSlideClassName?: string | SliderClassNameStates;
  wrapperClassName?: string | SliderClassNameStates;
  previousBtnClassName?: string | SliderClassNameStates;
  nextBtnClassName?: string | SliderClassNameStates;
}

interface SliderProps extends SliderClassNames {
  isLightbox?: boolean;
  index?: number;
  itemsPerPage?: number;
  children?: (boolean | React.ReactChild)[];
  previousBtnLabel?: string;
  nextBtnLabel?: string;
}

const useGesture = createUseGesture([ dragAction, pinchAction ]);

export default function Slider({
  isLightbox = false,
  itemsPerPage: itemsPerPageProp = 1,
  children, index: indexProp = undefined,
  className, wrapperClassName, slideClassName, activeSlideClassName,
  previousBtnClassName, nextBtnClassName,
  previousBtnLabel = 'Previous slide', nextBtnLabel = 'Next slide'
}: SliderProps) {
  const [ activeIndex, setActiveIndex ] = useState(0);
  const currentIndexRef: React.MutableRefObject<number> = useRef(activeIndex);
  const sliderRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [ sliderSpringStyles, sliderSpring ] = useSpring(() => ({ x: 0 }));
  const [ itemSpringStyles, itemSpring ] = useSpring(() => ({ x: 0, y: 0, scale: 1 }));
  const hasChildren = children && children.length > 0;
  const animatedChildRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [ itemsPerPage, setItemsPerPageDelay, setItemsPerPage ] = useDebounce(itemsPerPageProp, 50);
  const [ slideDim, setSlideDimDelay, setSlideDim ] = useDebounce<number>(-1, 50);

  const updateSlideDim = useCallback(({ width: wrapperWidth }, skipAnimation) => {
    if (animatedChildRefs.current.length === 0) {
      return;
    }

    const {
      width: firstSlideDim
    } = animatedChildRefs.current[0]?.getBoundingClientRect() || { width: 0 };

    if (firstSlideDim <= 0) {
      return;
    }

    const itemsPerPage = Math.round(wrapperWidth / firstSlideDim);

    if (slideDim === -1) {
      setSlideDim(firstSlideDim);
      setItemsPerPage(itemsPerPage);
    } else {
      setSlideDimDelay(firstSlideDim);
      setItemsPerPageDelay(itemsPerPage);
    }

    if (!skipAnimation) {
      sliderSpring.start({
        x: firstSlideDim * -currentIndexRef.current,
        immediate: false
      });
    }
  }, [
    slideDim, sliderSpring,
    setSlideDim, setSlideDimDelay,
    setItemsPerPage, setItemsPerPageDelay
  ]);

  useResizeObserver(sliderRef, ({ contentRect }) => {
    updateSlideDim(contentRect, false);
  });

  useGesture(
    {
      onDrag: ({ down, movement, velocity, pinching, cancel, memo }) => {
        if (pinching || !hasChildren || slideDim <= 0) {
          return cancel();
        }

        if (itemSpringStyles.scale.get() > 1.3) {
          if (!memo) {
            memo = {
              x: itemSpringStyles.x.get(),
              y: itemSpringStyles.y.get()
            };
          }

          itemSpring.start({
            x: memo.x + movement[0],
            y: memo.y + movement[1],
            immediate: down
          });

          return down ? memo : undefined;
        }

        const movementIndexDelta = Math.abs(movement[0]) / slideDim;
        let indexDelta = Math.floor(movementIndexDelta);

        if (movementIndexDelta % 1 > .6) {
          indexDelta += 1;
        }

        if (!down) {
          const speedBasedDelta = velocity[0] / 4;
          indexDelta += Math.floor(speedBasedDelta);

          if (speedBasedDelta % 1 > .6) {
            indexDelta += 1;
          }
        }

        if (movement[0] > 0) {
          indexDelta *= -1
        }

        let newIndex = currentIndexRef.current + indexDelta;
        
        if (newIndex > children.length - itemsPerPage) {
          newIndex = children.length - itemsPerPage;
        }

        if (newIndex < 0) {
          newIndex = 0;
        }
        
        if (activeIndex !== newIndex) {
          setActiveIndex(newIndex);

          itemSpring.start({
            x: 0,
            y: 0,
            scale: 1,
            immediate: true
          });
        }

        let movementDelta = movement[0];

        if (!down) {
          currentIndexRef.current = newIndex;
          movementDelta = 0;
        }

        sliderSpring.start({
          x: slideDim * -currentIndexRef.current + movementDelta,
          immediate: down
        });
      },
      onPinch: ({
        origin: [ ox, oy ], first, movement: [ ms ],
        offset: [ scale ], memo, cancel, active
      }) => {
        if (animatedChildRefs.current.length === 0 || !sliderRef.current) {
          return cancel();
        }

        const slideAnimationEl = animatedChildRefs.current[activeIndex];

        if (slideAnimationEl && first) {
          const { width, height, x, y } = slideAnimationEl.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [ itemSpringStyles.x.get(), itemSpringStyles.y.get(), tx, ty ];
        }

        let x = memo[0] - (ms - 1) * memo[2];
        let y = memo[1] - (ms - 1) * memo[3];

        if (scale < .5) {
          scale = .5;
        }
        
        if (!active && scale > .7 && scale < 1.3) {
          x = 0;
          y = 0;
          scale = 1;
        }

        itemSpring.start({ scale, x, y });

        return memo;
      }
    },
    {
      target: sliderRef,
      eventOptions: { capture: false, passive: false },
      drag: {
        filterTaps: true,
        preventDefault: true
      },
      pinch: {
        scaleBounds: { min: .5, max: 5 },
        rubberband: true
      }
    }
  );

  useEffect(() => {
    if (!children || children.length === 0) {
      return;
    }

    let newMaxIndex = children.length - itemsPerPage;

    if (newMaxIndex < 0) {
      newMaxIndex = 0;
    }

    if (currentIndexRef.current > newMaxIndex) {
      setActiveIndex(newMaxIndex);
      currentIndexRef.current = newMaxIndex;
    }

    sliderSpring.start({
      x: slideDim * -currentIndexRef.current
    });
  }, [ slideDim, children, sliderSpring, itemsPerPage ]);

  useEffect(() => {
    document.addEventListener('gesturestart', preventEventDefault);
    document.addEventListener('gesturechange', preventEventDefault);
    document.addEventListener('gestureend', preventEventDefault);

    const onResize = () => {
      if (!sliderRef.current) {
        return;
      }

      updateSlideDim(sliderRef.current.getBoundingClientRect(), true);
    };

    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('gesturestart', preventEventDefault);
      document.removeEventListener('gesturechange', preventEventDefault);
      document.removeEventListener('gestureend', preventEventDefault);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!children) {
      animatedChildRefs.current = [];

      return;
    }

    animatedChildRefs.current = animatedChildRefs.current.slice(0, children.length);
  }, [ children ]);

  if (itemsPerPage < 1) {
    // TODO warn about itemsPerPage being below 1
    return null;
  }

  return (
    <div className={resolveClassName(className, isLightbox)}>
      <div ref={sliderRef} className={resolveClassName(wrapperClassName, isLightbox)}>
        <animated.div style={sliderSpringStyles}>
          {React.Children.map(children || [], (child, idx) => (
            <div
              key={(typeof child === 'object' && child.key) || idx}
              className={(
                idx === activeIndex
                  ? resolveClassName(activeSlideClassName, isLightbox)
                  : resolveClassName(slideClassName, isLightbox)
              )}
            >
              <animated.div
                style={idx === activeIndex ? itemSpringStyles : {}}
                ref={el => animatedChildRefs.current[idx] = el}
              >
                {child}
              </animated.div>
            </div>
          ))}
        </animated.div>
      </div>
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
