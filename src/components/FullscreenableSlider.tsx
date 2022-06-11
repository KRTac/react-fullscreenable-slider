import React, { useState } from 'react';
import Modal from 'react-modal';

import Slider, { SliderClassNames, SliderProps } from './Slider';
import { useChildren } from '../hooks';


export interface ModalClassNameObject {
  base: string;
  afterOpen: string;
  beforeClose: string;
}

export interface FullscreenableSliderClassNames {
  /**
   * Class attached to the modal element in fullscreen mode. If set, it will
   * override the default element styes applied by `react-modal`.
   * 
   * It can also be an object with `base`, `afterOpen` and `beforeClose` keys.
   * See [`react-modal`'s docs][1] for details.
   * 
   * [1]: https://reactcommunity.org/react-modal/styles/classes/
   */
  modalClassName?: string | ModalClassNameObject;

  /**
   * Class attached to the overlay element in fullscreen mode. If set, it will
   * override the default element styes applied by `react-modal`.
   * 
   * It can also be an object with `base`, `afterOpen` and `beforeClose` keys.
   * See [`react-modal`'s docs][1] for details.
   * 
   * [1]: https://reactcommunity.org/react-modal/styles/classes/
   */
  modalOverlayClassName?: string | ModalClassNameObject;

  /**
   * Class attached to the modal portal in fullscreen mode. Defaults to the
   * value set by `react-modal`.
   */
  modalPortalClassName?: string;

  /**
   * Class attached to the `body` element in fullscreen mode. Defaults to the
   * value set by `react-modal`.
   * 
   * **Note:** Due to the implementation of this prop in `react-modal`, it can
   * only be a single class name.
   */
  modalBodyOpenClassName?: string;

  /**
   * Class attached to the `html` element in fullscreen mode.
   * 
   * **Note:** Due to the implementation of this prop in `react-modal`, it can
   * only be a single class name.
   */
  modalHtmlOpenClassName?: string;
}
export interface FullscreenableSliderClassNames extends SliderClassNames {}

export interface FullscreenableSliderProps {
  /**
   * A text describing the content of the lightbox modal. It gets passed to
   * [`react-modal`'s contentLabel][1]. This is important for
   * [screen reader accessibility][2].
   * 
   * [1]: http://reactcommunity.org/react-modal/accessibility/#aria
   * [2]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
   */
  modalLabel?: string;

  /**
   * Enables the lightbox functionality.
   */
  withLightbox?: boolean;

  /**
   * Standard react children prop.
   */
  children?: React.ReactNode;
}
export interface FullscreenableSliderProps extends Omit<
  SliderProps,
  'children' | 'lightboxMode'
> {}
export interface FullscreenableSliderProps extends FullscreenableSliderClassNames {}


function FullscreenableSlider({
  children: childrenProp,
  modalLabel,
  itemsPerPage,
  withLightbox,
  index, onIndexChange,
  className, wrapperClassName,
  slideClassName, activeSlideClassName, visibleSlideClassName,
  previousBtnClassName, nextBtnClassName,
  modalClassName, modalOverlayClassName, modalPortalClassName,
  modalBodyOpenClassName, modalHtmlOpenClassName
}: FullscreenableSliderProps) {
  const [ lightboxIndex, setLightboxIndex ] = useState(-1);
  const [ body, lightboxBody ] = useChildren(childrenProp);

  const sharedProps = {
    className: className,
    slideClassName: slideClassName,
    activeSlideClassName: activeSlideClassName,
    visibleSlideClassName: visibleSlideClassName,
    wrapperClassName: wrapperClassName,
    previousBtnClassName: previousBtnClassName,
    nextBtnClassName: nextBtnClassName
  };

  return (
    <>
      {withLightbox && (
        <Modal
          isOpen={lightboxIndex > -1}
          contentLabel={modalLabel}
          onRequestClose={() => setLightboxIndex(-1)}
          className={modalClassName}
          overlayClassName={modalOverlayClassName}
          portalClassName={modalPortalClassName}
          bodyOpenClassName={modalBodyOpenClassName}
          htmlOpenClassName={modalHtmlOpenClassName}
        >
          <Slider
            {...sharedProps}
            itemsPerPage={1}
            lightboxMode
          >
            {lightboxBody}
          </Slider>
        </Modal>
      )}
      <Slider
        {...sharedProps}
        itemsPerPage={itemsPerPage}
        index={index}
        onIndexChange={onIndexChange}
      >
        {body}
      </Slider>
    </>
  );
}

FullscreenableSlider.defaultProps = {
  ...Slider.defaultProps,
  withLightbox: false
};

export default FullscreenableSlider;
