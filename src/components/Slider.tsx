import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react';
import { useSpring, useSprings, animated } from '@react-spring/web';
import useResizeObserver from '@react-hook/resize-observer';
import { useDebounce } from '@react-hook/debounce';

import {
  resolveClassName, noop, preventEventDefault,
  isVisibleIndex, getAnimationTargetIndex
} from '../utils';


export interface SliderClassNameStates {
  base?: string;
  fullscreen?: string;
}

export interface SliderClassNames {
  className?: string | SliderClassNameStates;
  slideClassName?: string | SliderClassNameStates;
  activeSlideClassName?: string | SliderClassNameStates;
  visibleSlideClassName?: string | SliderClassNameStates;
  wrapperClassName?: string | SliderClassNameStates;
  previousBtnClassName?: string | SliderClassNameStates;
  nextBtnClassName?: string | SliderClassNameStates;
}

export interface SliderProps {
  isLightbox?: boolean;
  index?: number;
  itemsPerPage?: number;
  children?: (boolean | React.ReactChild)[];
  previousBtnLabel?: string;
  nextBtnLabel?: string;
  calculateItemsPerPage?: boolean;
  previousBtnContent?: React.ReactElement;
  nextBtnContent?: React.ReactElement;
}
export interface SliderProps extends SliderClassNames {}


const DEFAULT_BOUNDS = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
};

const useGesture = createUseGesture([ dragAction, pinchAction ]);

export default function Slider({
  isLightbox = false,
  itemsPerPage: itemsPerPageProp = 1,
  children, index: indexProp = undefined,
  className, wrapperClassName, slideClassName, activeSlideClassName, visibleSlideClassName,
  previousBtnClassName, nextBtnClassName,
  previousBtnLabel = 'Previous slide', nextBtnLabel = 'Next slide',
  calculateItemsPerPage = true,
  previousBtnContent, nextBtnContent
}: SliderProps) {
  const isReady = useRef(false);
  const childrenCount = (children && children.length) || 0;
  const [ activeIndex, setActiveIndex ] = useState(indexProp || 0);
  const [ firstVisibleIndex, setFirstVisibleIndex ] = useState(activeIndex);
  const visibleIndex: React.MutableRefObject<number> = useRef(firstVisibleIndex);
  const rootBounds: React.MutableRefObject<object | undefined> = useRef(undefined);
  const sliderRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [ dragBounds, setDragBounds ] = useState<Object | undefined>(DEFAULT_BOUNDS);
  const [ sliderSpringStyles, sliderSpring ] = useSpring(() => ({ x: 0 }));
  const [ itemSpringStyles, itemSprings ] = useSprings(childrenCount, () => ({
    x: 0,
    y: 0,
    scale: 1
  }));
  const animatedChildRefs = useRef<Array<HTMLElement | null>>([]);
  const [
    itemsPerPage,
    setItemsPerPageDelay,
    setItemsPerPage
  ] = useDebounce(itemsPerPageProp, 50);
  const [ slideDim, setSlideDimDelay, setSlideDim ] = useDebounce<number>(-1, 50);

  const updateSlideDim = useCallback(({ width: wrapperWidth }, skipAnimation) => {
    if (animatedChildRefs.current.length === 0) {
      return;
    }

    let {
      width: firstSlideDim
    } = animatedChildRefs.current[0]?.getBoundingClientRect() || { width: 0 };

    let itemsPerPage = itemsPerPageProp;

    if (calculateItemsPerPage) {
      if (firstSlideDim <= 0) {
        return;
      }

      itemsPerPage = Math.round(wrapperWidth / firstSlideDim);
    } else {
      firstSlideDim = wrapperWidth / itemsPerPageProp;
    }

    if (!isReady.current) {
      isReady.current = true;
      setSlideDim(firstSlideDim);
      setItemsPerPage(itemsPerPage);
    } else {
      setSlideDimDelay(firstSlideDim);
      setItemsPerPageDelay(itemsPerPage);
    }

    if (!skipAnimation) {
      sliderSpring.start({
        x: firstSlideDim * -visibleIndex.current
      });
    }
  }, [
    calculateItemsPerPage, itemsPerPageProp, sliderSpring,
    setSlideDim, setSlideDimDelay,
    setItemsPerPage, setItemsPerPageDelay
  ]);

  useResizeObserver(sliderRef, ({ contentRect }) => {
    updateSlideDim(contentRect, false);
  });

  useGesture(
    {
      onDrag: ({ down, movement, velocity, pinching, cancel, memo, target, offset }) => {
        if (pinching || slideDim <= 0 || childrenCount === 0) {
          return cancel();
        }

        let targetScale = 1;
        const eventTargetIndex = getAnimationTargetIndex(target as HTMLElement, animatedChildRefs.current);
        
        if (itemSpringStyles[eventTargetIndex]) {
          targetScale = itemSpringStyles[eventTargetIndex].scale.get();
        }

        if (targetScale > 1) {
          if (!memo) {
            memo = {
              x: itemSpringStyles[eventTargetIndex].x.get(),
              y: itemSpringStyles[eventTargetIndex].y.get()
            };
          }

          itemSprings.start(idx => {
            if (idx === eventTargetIndex) {
              return {
                x: memo.x + movement[0],
                y: memo.y + movement[1],
                immediate: down
              };
            }
          });

          return down ? memo : undefined;
        }

        let newIndex = Math.round(Math.abs(offset[0]) / slideDim);

        if (!down) {
          const speedBasedDelta = Math.round(velocity[0] / 4);

          newIndex += movement[0] < 0 ? speedBasedDelta : -speedBasedDelta;
        }

        if (activeIndex !== newIndex) {
          setActiveIndex(newIndex);
        }

        let newVisibleIndex = newIndex;
        
        if (newVisibleIndex > childrenCount - itemsPerPage) {
          newVisibleIndex = childrenCount - itemsPerPage;
        }

        if (newVisibleIndex < 0) {
          newVisibleIndex = 0;
        }

        if (firstVisibleIndex !== newVisibleIndex) {
          itemSprings.start(idx => {
            if (!isVisibleIndex(idx, newVisibleIndex, itemsPerPage)) {
              return {
                x: 0,
                y: 0,
                scale: 1
              };
            }
          });

          setFirstVisibleIndex(newVisibleIndex);
        }

        let movementDelta = offset[0];

        if (!down) {
          visibleIndex.current = newVisibleIndex;
          movementDelta = slideDim * -visibleIndex.current;
        }

        sliderSpring.start({
          x: movementDelta,
          immediate: down
        });
      },
      onPinch: ({
        origin: [ ox, oy ], first, movement: [ ms ],
        offset: [ scale ], memo, cancel, active, target
      }) => {
        if (animatedChildRefs.current.length === 0 || !sliderRef.current) {
          return cancel();
        }

        const eventTargetIndex = getAnimationTargetIndex(target as HTMLElement, animatedChildRefs.current);
        const eventTarget = animatedChildRefs.current[eventTargetIndex];

        if (eventTarget && first) {
          const { width, height, x, y } = eventTarget.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [
            itemSpringStyles[eventTargetIndex].x.get(),
            itemSpringStyles[eventTargetIndex].y.get(),
            tx, ty
          ];
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

        itemSprings.start(idx => {
          if (idx === eventTargetIndex) {
            return { scale, x, y };
          }
        });

        return memo;
      },
      onPointerDownCapture: ({ event }) => {
        const eventTargetIndex = getAnimationTargetIndex(event.target as HTMLElement, animatedChildRefs.current);
        
        if (itemSpringStyles[eventTargetIndex] && itemSpringStyles[eventTargetIndex].scale.get() !== 1) {
          rootBounds.current = dragBounds;

          setDragBounds(undefined);
        } else {
          rootBounds.current = undefined;
        }
      },
      onPointerUpCapture: () => {
        if (rootBounds.current) {
          setDragBounds(rootBounds.current);
          rootBounds.current = undefined;
        }
      }
    },
    {
      target: sliderRef,
      eventOptions: { capture: false, passive: false },
      drag: {
        filterTaps: true,
        preventDefault: true,
        bounds: dragBounds,
        rubberband: !!dragBounds,
        from: () => {
          if (rootBounds.current) {
            return [ 0, 0 ];
          }

          return [ sliderSpringStyles.x.get(), 0 ];
        }
      },
      pinch: {
        scaleBounds: { min: .5, max: 5 }
      }
    }
  );

  useEffect(() => {
    if (!children || children.length === 0) {
      return;
    }

    let maxIndex = children.length - 1;
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }

    let maxVisibleIndex = children.length - itemsPerPage;

    if (maxVisibleIndex < 0) {
      maxVisibleIndex = 0;
    }

    if (visibleIndex.current > maxVisibleIndex) {
      setFirstVisibleIndex(maxVisibleIndex);
      visibleIndex.current = maxVisibleIndex;
    }

    if (slideDim <= 0) {
      return;
    }

    sliderSpring.start({
      x: slideDim * -visibleIndex.current
    });

    let left = slideDim * children.length - slideDim * itemsPerPage;

    if (left <= 0) {
      left = 0;
    } else {
      left = -left;
    }

    setDragBounds({ ...DEFAULT_BOUNDS, left });
  }, [ slideDim, children, sliderSpring, itemsPerPage, activeIndex ]);

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
  }, [ updateSlideDim ]);

  useEffect(() => {
    if (!sliderRef.current) {
      return;
    }

    updateSlideDim(sliderRef.current.getBoundingClientRect(), false);
  }, [ updateSlideDim ]);

  useEffect(() => {
    if (!children) {
      animatedChildRefs.current = [];

      return;
    }

    animatedChildRefs.current = animatedChildRefs.current.slice(0, children.length);
  }, [ children ]);

  const updateActiveIndex = useCallback((index) => {
    let newIndex = index % childrenCount;

    if (newIndex < 0) {
      newIndex = childrenCount + newIndex;
    }

    if (activeIndex !== newIndex) {
      setActiveIndex(newIndex);
    }

    let newVisibleIndex = newIndex;
    
    if (newVisibleIndex > childrenCount - itemsPerPage) {
      newVisibleIndex = childrenCount - itemsPerPage;
    }

    if (newVisibleIndex < 0) {
      newVisibleIndex = 0;
    }

    if (firstVisibleIndex !== newVisibleIndex) {
      itemSprings.start(idx => {
        if (!isVisibleIndex(idx, newVisibleIndex, itemsPerPage)) {
          return {
            x: 0,
            y: 0,
            scale: 1
          };
        }
      });

      setFirstVisibleIndex(newVisibleIndex);
      visibleIndex.current = newVisibleIndex;
    }

    sliderSpring.start({
      x: slideDim * -visibleIndex.current
    });
  }, [
    childrenCount, activeIndex, itemsPerPage, firstVisibleIndex,
    itemSprings, sliderSpring
  ]);

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
              className={resolveClassName((
                idx === activeIndex
                  ? activeSlideClassName
                  : isVisibleIndex(idx, firstVisibleIndex, itemsPerPage)
                    ? visibleSlideClassName
                    : slideClassName
              ), isLightbox)}
            >
              <animated.div
                style={itemSpringStyles[idx]}
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
        onClick={() => updateActiveIndex(activeIndex - 1)}
        aria-label={previousBtnLabel}
        tabIndex={0}
        role="button"
        onKeyPress={noop}
      >
        {previousBtnContent}
      </span>
      <span
        className={resolveClassName(nextBtnClassName, isLightbox)}
        onClick={() => updateActiveIndex(activeIndex + 1)}
        aria-label={nextBtnLabel}
        tabIndex={0}
        role="button"
        onKeyPress={noop}
      >
        {nextBtnContent}
      </span>
    </div>
  );
}
