import React, { useEffect, useRef } from 'react';
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react';
import { useSpring, useSprings, animated } from '@react-spring/web';

import {
  resolveClassName, noop, isVisibleIndex
} from '../utils';
import {
  useAnimationTargets, useItemsPerPage, useAxisDimensions, useActiveIndex,
  useViewport, useSlider, useGestures
} from '../hooks';


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
  /**
   * The index of the desired active item when using external state management.
   * The component will revert to internal state management when not set. Use
   * with `onIndexChange`.
   */
  index?: number;

  onIndexChange?: (index: number) => any;

  /**
   * Controls the number of items set as visible around the active item during
   * first render, before layout sizing and before `itemsPerPage` takes control.
   * 
   * An item is each individual child element of the slider. You can also use
   * nested react fragments, as they get flattened out into a single children
   * array.
   * 
   * **Note:** If not set, it will take the value of `itemsPerPage` if it's set
   * to a number, otherwise it will default to 1.
   * 
   * This is useful for server side rendering (SSR) and similar situations.
   */
  initialItemsPerPage?: number;

  /**
   * Controls the responsive capabilities of the slider by indicating the number
   * of items displayed on the slider at the same time. This takes effect after
   * the initial render of the component and it overrides the
   * `initialItemsPerPage` prop setting.
   * 
   * An item is each individual child element of the slider. You can also use
   * nested react fragments, as they get flattened out into a single children
   * array.
   * 
   * If set to `'auto'`, the slider will calculate the number of slides based on
   * the dimensions set by the CSS. It tracks changes in slider and document
   * size, so it responds to responsive designs automatically. That way you can
   * vary the number of items per page with media queries inside CSS, without
   * the need to manually specify the number of items for each responsive step
   * via props.
   * 
   * *Link to example*
   * 
   * It can also be set directly to the desired number of items per page,
   * without dimension calculation. That can be useful e.g. if you have an
   * external control for the number of items on a page. The slider still
   * expects the actual sizing of each slide to be defined using CSS. A helper
   * class is attached to the slide wrapper element indicating the number of
   * items per page. That can be used in CSS to then size each slide. See
   * `itemsPerPageClassName`
   */
  itemsPerPage?: number | string;

  /**
   * Partial class name applied to the slide wrapper element indicating the
   * number of items per page. The number of items per page is appended to this
   * value.
   * 
   * ```
   * 
   * ...
   * itemsPerPageClassName="per-page-"
   * itemsPerPage={3}
   * ...
   * 
   * class name: per-page-3
   * ```
   * 
   * This is useful when controlling `itemsPerPage` manually instead of using
   * `'auto'`, as it can enable the sizing of slides depending on the desired
   * number of items per page using CSS classes.
   * 
   * Here `slideClassName` is set to `slide-wrapper` and `wrapperClassName` is
   * `slider`, the same as the [default slider theme][1].
   * 
   * ```css
   * .slider .slide-wrapper {
   *   width: 100%;
   *   ...
   * }
   * 
   * .slider.per-page-2 .slide-wrapper {
   *   width: calc(100% / 2)
   * }
   * 
   * .slider.per-page-3 .slide-wrapper {
   *   width: calc(100% / 3)
   * }
   * 
   * ...
   * ```
   * 
   * [1]: #
   */
  itemsPerPageClassName?: string;

  children?: (boolean | React.ReactChild)[];

  /**
   * [ARIA label][1] for the previous navigation button.
   * 
   * [1]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
   */
  previousBtnLabel?: string;

  /**
   * [ARIA label][1] for the next navigation button.
   * 
   * [1]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
   */
  nextBtnLabel?: string;

  /**
   * Content added to the previous navigation button.
   */
  previousBtnContent?: React.ReactElement;

  /**
   * Content added to the previous navigation button.
   */
  nextBtnContent?: React.ReactElement;

  /**
   * Display in lightbox mode if `true`
   */
  lightboxMode?: boolean;
}
export interface SliderProps extends SliderClassNames {}


const DEFAULT_BOUNDS = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
};

const useGesture = createUseGesture([ dragAction, pinchAction ]);

function Slider({
  lightboxMode,
  itemsPerPage: itemsPerPageProp = 'auto',
  children, index: indexProp = 0, onIndexChange,
  className, wrapperClassName, slideClassName, activeSlideClassName,
  visibleSlideClassName,
  previousBtnClassName, nextBtnClassName,
  previousBtnLabel, nextBtnLabel,
  previousBtnContent, nextBtnContent
}: SliderProps) {
  const childrenCount = (children && children.length) || 0;

  const animationTargets = useAnimationTargets(childrenCount);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const [ sliderDim, itemDim, setItemDim ] = useAxisDimensions(
    sliderRef,
    animationTargets,
    itemsPerPageProp
  );

  const itemsPerPage = useItemsPerPage(
    itemsPerPageProp,
    sliderDim,
    itemDim,
    setItemDim
  );

  const wasDragging = useRef<boolean | undefined>(undefined);

  const [ activeIndex, setActiveIndex ] = useActiveIndex(
    childrenCount,
    indexProp,
    onIndexChange
  );
  const [ firstIndex, setFirstIndex ] = useViewport(
    activeIndex,
    childrenCount,
    itemsPerPage,
    wasDragging
  );

  const [ sliderSpringStyles, sliderApi ] = useSlider(
    activeIndex,
    firstIndex,
    itemDim,
    wasDragging,
    childrenCount,
    itemsPerPage,
    setFirstIndex,
    setActiveIndex
  );

  const [ itemSpringStyles, itemSprings ] = useSprings(childrenCount, () => ({
    x: 0,
    y: 0,
    scale: 1
  }));

  useGestures(
    sliderRef, itemDim, childrenCount, itemsPerPage, animationTargets,
    itemSpringStyles, itemSprings, sliderSpringStyles, sliderApi, wasDragging
  );

  return (
    <div className={resolveClassName(className, lightboxMode)}>
      <div
        ref={sliderRef}
        className={resolveClassName(wrapperClassName, lightboxMode)}
      >
        <animated.div style={sliderSpringStyles}>
          {React.Children.map(children || [], (child, idx) => {
            let className = (
              resolveClassName(slideClassName, lightboxMode) ||
              ''
            );

            if (isVisibleIndex(idx, firstIndex, itemsPerPage)) {
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
                  ref={el => animationTargets.current[idx] = el}
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
        onClick={() => setActiveIndex(activeIndex - 1)}
        aria-label={previousBtnLabel}
        tabIndex={0}
        role="button"
        onKeyPress={noop}
      >
        {previousBtnContent}
      </span>
      <span
        className={resolveClassName(nextBtnClassName, lightboxMode)}
        onClick={() => setActiveIndex(activeIndex + 1)}
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

Slider.defaultProps = {
  index: 0,
  itemsPerPage: 'auto',
  previousBtnLabel: 'Previous',
  nextBtnLabel: 'Next'
};

export default Slider;
