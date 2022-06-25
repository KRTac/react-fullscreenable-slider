import React, { useRef } from 'react';
import { animated } from '@react-spring/web';

import {
  resolveClassName, noop, isVisibleIndex
} from '../utils';
import {
  useAnimationTargets, useItemsPerPage, useAxisDimensions, useIndex,
  useViewport, useSlider, useGestures, useBlockSafariGestures, useItemSprings,
  useNavigation
} from '../hooks';


export interface SliderClassNameStates {
  base?: string;
  fullscreen?: string;
}

export interface SliderComponentClassNames {
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
  itemsPerPageClassName?: string | SliderClassNameStates;
}

export interface SharedProps {
  /**
   * Determines the item opened to the user on init, but also changes the view
   * on every value change. Internally the actual state could change by user
   * interaction (sliding or using the navigation), unless you set the
   * `onIndexChange` callback.
   */
  index?: number;

  /**
   * Optional callback run every time an index change is required (user sliding
   * or using the navigation). Use it with the `index` prop to control a
   * component's view with external state. By default the component uses it's
   * internal state.
   * 
   * ```
   * function CustomSlider(props)
   *   const [ activeSlide, setActiveSlide ] = useState(0);
   * 
   *   return (
   *     <Slider
   *       index={activeSlide}
   *       onIndexChange={setActiveSlide}
   *       {...props}
   *     />
   *   );
   * }
   * ```
   */
  onIndexChange?: (index: number) => any;

  /**
   * Controls the responsive capabilities of the slider by indicating the number
   * of items displayed on the slider at the same time.
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
  itemsPerPage?: number | 'auto';

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

  navigationTarget?: 'items' | 'slide';

  navigationTriggers?: any[];

  /**
   * Add arbitrary props
   */
  [key: string]: any;
}

interface SliderComponentProps {
  /**
   * Display in lightbox mode if `true`
   */
  lightboxMode?: boolean;

  children?: (boolean | React.ReactChild)[];

  onItemClick?: (index: number) => any;
}
interface SliderComponentProps extends SharedProps {}
interface SliderComponentProps extends SliderComponentClassNames {}


function SliderComponent({
  lightboxMode,
  itemsPerPage: itemsPerPageProp = 'auto',
  children, index: indexProp = 0, onIndexChange,
  className, wrapperClassName, slideClassName, activeSlideClassName,
  visibleSlideClassName, itemsPerPageClassName,
  previousBtnClassName, nextBtnClassName,
  previousBtnLabel, nextBtnLabel,
  previousBtnContent, nextBtnContent,
  onItemClick, navigationTarget = 'slide', navigationTriggers = [ 0, 0 ]
}: SliderComponentProps) {
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
  const navLock = useRef<boolean>(false);

  let [ activeIndex, setActiveIndex ] = useIndex(
    childrenCount,
    indexProp,
    onIndexChange ? (index) => onIndexChange(index || 0) : undefined
  );
  const [ firstIndex, setFirstIndex ] = useViewport(
    activeIndex || 0,
    childrenCount,
    itemsPerPage,
    wasDragging,
    navigationTarget,
    navLock
  );

  const [ sliderSpringStyles, sliderApi ] = useSlider(
    activeIndex || 0,
    firstIndex,
    itemDim,
    wasDragging,
    childrenCount,
    itemsPerPage,
    setFirstIndex,
    setActiveIndex
  );

  const [ itemSpringStyles, itemSprings ] = useItemSprings(
    childrenCount,
    firstIndex,
    itemsPerPage
  );

  useGestures(
    sliderRef, itemDim, childrenCount, itemsPerPage, animationTargets,
    itemSpringStyles, itemSprings, sliderSpringStyles, sliderApi, wasDragging
  );

  useBlockSafariGestures();

  let [ navDown, navUp ] = useNavigation(
    navigationTarget,
    activeIndex || 0,
    setActiveIndex,
    firstIndex,
    setFirstIndex,
    itemsPerPage,
    childrenCount,
    navLock,
    navigationTriggers
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

            const perPageClassName = resolveClassName(
              itemsPerPageClassName,
              lightboxMode
            );

            if (perPageClassName) {
              className += ' ' + perPageClassName + itemsPerPage;
            }

            return (
              <div
                key={(typeof child === 'object' && child.key) || idx}
                className={className}
                onClick={() => onItemClick && onItemClick(idx)}
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
        onClick={navDown}
        aria-label={previousBtnLabel}
        tabIndex={0}
        role="button"
        onKeyPress={noop}
      >
        {previousBtnContent}
      </span>
      <span
        className={resolveClassName(nextBtnClassName, lightboxMode)}
        onClick={navUp}
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

SliderComponent.defaultProps = {
  index: 0,
  itemsPerPage: 'auto',
  previousBtnLabel: 'Previous',
  nextBtnLabel: 'Next',
  navigationTarget: 'slide'
};

export default SliderComponent;
