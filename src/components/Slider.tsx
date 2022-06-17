import React, { useCallback } from 'react';
import ReactModal, { setAppElement } from 'react-modal';
import useLatest from '@react-hook/latest';

import {
  default as SliderComponent,
  SliderComponentClassNames, SharedProps
} from './SliderComponent';
import { useFilteredChildren, useIndex } from '../hooks';


export function setModalAppElement(appEl: string | HTMLElement) {
  setAppElement(appEl);
}

export interface SliderClassNames {
  /**
   * Class attached to the modal element in fullscreen mode. If set, it will
   * override the default element styes applied by `react-modal`.
   * 
   * It can also be an object with `base`, `afterOpen` and `beforeClose` keys.
   * See [`react-modal`'s docs][1] for details.
   * 
   * [1]: https://reactcommunity.org/react-modal/styles/classes/
   */
  modalClassName?: string | ReactModal.Classes;

  /**
   * Class attached to the overlay element in fullscreen mode. If set, it will
   * override the default element styes applied by `react-modal`.
   * 
   * It can also be an object with `base`, `afterOpen` and `beforeClose` keys.
   * See [`react-modal`'s docs][1] for details.
   * 
   * [1]: https://reactcommunity.org/react-modal/styles/classes/
   */
  modalOverlayClassName?: string | ReactModal.Classes;

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
export interface SliderClassNames extends SliderComponentClassNames {}

export interface SliderProps {
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

  lightboxIndex?: number;

  onLightboxIndexChange?: (index?: number) => any;
}
export interface SliderProps extends SharedProps {}
export interface SliderProps extends SliderClassNames {}


function Slider({
  children: childrenProp,
  modalLabel,
  itemsPerPage,
  withLightbox,
  index, onIndexChange,
  lightboxIndex: lightboxIndexProp, onLightboxIndexChange,
  className, wrapperClassName,
  slideClassName, activeSlideClassName, visibleSlideClassName,
  previousBtnClassName, nextBtnClassName,
  modalClassName, modalOverlayClassName, modalPortalClassName,
  modalBodyOpenClassName, modalHtmlOpenClassName
}: SliderProps) {
  const [ body, lightboxBody ] = useFilteredChildren(childrenProp);
  const [
    lightboxIndex, setLightboxIndex
  ] = useIndex(lightboxBody.length, lightboxIndexProp, onLightboxIndexChange);

  const handleItemClick = useCallback((idx) => {
    if (withLightbox) {
      setLightboxIndex(idx);
    }
  }, [ withLightbox, setLightboxIndex ]);

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
        <ReactModal
          isOpen={typeof lightboxIndex !== 'undefined'}
          contentLabel={modalLabel}
          onRequestClose={() => setLightboxIndex(undefined)}
          className={modalClassName}
          overlayClassName={modalOverlayClassName}
          portalClassName={modalPortalClassName}
          bodyOpenClassName={modalBodyOpenClassName}
          htmlOpenClassName={modalHtmlOpenClassName}
        >
          <SliderComponent
            {...sharedProps}
            index={lightboxIndex}
            onIndexChange={setLightboxIndex}
            lightboxMode
          >
            {lightboxBody}
          </SliderComponent>
        </ReactModal>
      )}
      <SliderComponent
        {...sharedProps}
        itemsPerPage={itemsPerPage}
        index={index}
        onIndexChange={onIndexChange}
        onItemClick={handleItemClick}
      >
        {body}
      </SliderComponent>
    </>
  );
}

Slider.defaultProps = {
  ...SliderComponent.defaultProps,
  withLightbox: false
};

export default Slider;
