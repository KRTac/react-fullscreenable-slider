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
  /**
   * Class name prop for the root element. Optionally, it can be set as an
   * object with `base` and `fullscreen` class names.
   */
  className?: string | SliderClassNameStates;

  /**
   * Class name prop for each slide element. Optionally, it can be set as an
   * object with `base` and `fullscreen` class names.
   */
  slideClassName?: string | SliderClassNameStates;

  /**
   * Class names attached to all currently visible slides, extending the
   * existing `slideClassName`. Optionally, it can be set as an object with
   * `base` and `fullscreen` class names.
   */
  visibleSlideClassName?: string | SliderClassNameStates;

  /**
   * Class names attached to the currently active slide, extending the existing
   * `slideClassName` and `visibleSlideClassName`. Optionally, it can be
   * set as an object with `base` and `fullscreen` class names.
   */
  activeSlideClassName?: string | SliderClassNameStates;

  /**
   * Class name prop for the actual slide wrapper element. Optionally, it can be
   * set as an object with `base` and `fullscreen` class names.
   */
  wrapperClassName?: string | SliderClassNameStates;

  /**
   * Class name prop for the previous navigation button. Optionally, it can be
   * set as an object with `base` and `fullscreen` class names.
   */
  previousBtnClassName?: string | SliderClassNameStates;

  /**
   * Class name prop for the next navigation button. Optionally, it can be set
   * as an object with `base` and `fullscreen` class names.
   */
  nextBtnClassName?: string | SliderClassNameStates;
}

export interface SliderProps {
  lightboxMode?: boolean;
  index?: number;
  itemsPerPage?: number | string;
  children?: (boolean | React.ReactChild)[];
  previousBtnLabel?: string;
  nextBtnLabel?: string;
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
  lightboxMode = false,
  itemsPerPage: itemsPerPageProp = 'auto',
  children, index: indexProp = undefined,
  className, wrapperClassName, slideClassName, activeSlideClassName, visibleSlideClassName,
  previousBtnClassName, nextBtnClassName,
  previousBtnLabel = 'Previous slide', nextBtnLabel = 'Next slide',
  previousBtnContent, nextBtnContent
}: SliderProps) {
  const isReady = useRef(false);
  const childrenCount = (children && children.length) || 0;
  const [ activeIndex, setActiveIndex ] = useState(indexProp || 0);
  const [ firstVisibleIndex, setFirstVisibleIndex ] = useState(activeIndex);
  const visibleIndex: React.MutableRefObject<number> = useRef(firstVisibleIndex);
  const sliderRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
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
  ] = useDebounce(typeof itemsPerPageProp === 'number' ? itemsPerPageProp : 1, 50);
  const [ slideDim, setSlideDimDelay, setSlideDim ] = useDebounce<number>(-1, 50);

  const updateSlideDim = useCallback(({ width: wrapperWidth }, skipAnimation) => {
    if (animatedChildRefs.current.length === 0) {
      return;
    }

    let {
      width: firstSlideDim
    } = animatedChildRefs.current[0]?.getBoundingClientRect() || { width: 0 };

    let itemsPerPage = itemsPerPageProp;

    if (itemsPerPage === 'auto') {
      if (firstSlideDim <= 0) {
        return;
      }

      itemsPerPage = Math.round(wrapperWidth / firstSlideDim);
    } else {
      firstSlideDim = wrapperWidth / (itemsPerPage as number);
    }

    if (!isReady.current) {
      isReady.current = true;
      setSlideDim(firstSlideDim);
      setItemsPerPage(itemsPerPage as number);
    } else {
      setSlideDimDelay(firstSlideDim);
      setItemsPerPageDelay(itemsPerPage as number);
    }

    if (!skipAnimation) {
      sliderSpring.start({
        x: firstSlideDim * -visibleIndex.current
      });
    }
  }, [
    itemsPerPageProp, sliderSpring,
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
          const speedBasedDelta = Math.round(velocity[0] / 2);

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
      }
    },
    {
      target: sliderRef,
      eventOptions: { capture: false, passive: false },
      drag: {
        filterTaps: true,
        preventDefault: true,
        // @ts-ignore
        bounds: ({ target }) => {
          const eventTargetIndex = getAnimationTargetIndex(target as HTMLElement, animatedChildRefs.current);
          
          if (
            animatedChildRefs.current[eventTargetIndex] &&
            itemSpringStyles[eventTargetIndex] &&
            itemSpringStyles[eventTargetIndex].scale.get() !== 1
          ) {
            const bounds = { top: -Infinity, bottom: Infinity, left: -Infinity, right: Infinity };
            // const itemRect = animatedChildRefs.current[eventTargetIndex].getBoundingClientRect();
            
            // bounds.left = (itemRect.width - slideDim) / -2;
            // bounds.right = -bounds.left;

            return bounds;
          }

          let left = slideDim * childrenCount - slideDim * itemsPerPage;
      
          if (left <= 0) {
            left = 0;
          } else {
            left = -left;
          }
      
          return { ...DEFAULT_BOUNDS, left };
        },
        rubberband: true,
        from: ({ target }) => {
          const eventTargetIndex = getAnimationTargetIndex(target as HTMLElement, animatedChildRefs.current);
          
          if (
            animatedChildRefs.current[eventTargetIndex] &&
            itemSpringStyles[eventTargetIndex] &&
            itemSpringStyles[eventTargetIndex].scale.get() !== 1
          ) {
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
    <div className={resolveClassName(className, lightboxMode)}>
      <div
        ref={sliderRef}
        className={resolveClassName(wrapperClassName, lightboxMode)}
      >
        <animated.div style={sliderSpringStyles}>
          {React.Children.map(children || [], (child, idx) => {
            let className = resolveClassName(slideClassName, lightboxMode) || '';

            if (isVisibleIndex(idx, firstVisibleIndex, itemsPerPage)) {
              const visibleClassName = resolveClassName(
                visibleSlideClassName,
                lightboxMode
              );

              if (visibleClassName) {
                className += ' ' + visibleClassName;
              }

              if (idx === activeIndex) {
                const activeClassName = resolveClassName(
                  activeSlideClassName,
                  lightboxMode
                );
  
                if (activeClassName) {
                  className += ' ' + activeClassName;
                }
              }
            }

            return (
              <div
                key={(typeof child === 'object' && child.key) || idx}
                className={className}
              >
                <animated.div
                  style={itemSpringStyles[idx]}
                  ref={el => animatedChildRefs.current[idx] = el}
                >
                  {child}
                </animated.div>
              </div>
            );
          })}
        </animated.div>
      </div>
      <span
        className={resolveClassName(previousBtnClassName, lightboxMode)}
        onClick={() => updateActiveIndex(activeIndex - 1)}
        aria-label={previousBtnLabel}
        tabIndex={0}
        role="button"
        onKeyPress={noop}
      >
        {previousBtnContent}
      </span>
      <span
        className={resolveClassName(nextBtnClassName, lightboxMode)}
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
