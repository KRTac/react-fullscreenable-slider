import React, { useState } from 'react';
import Modal from 'react-modal';
import { isElement } from 'react-is';

import Slider, { SliderClassNames, SliderProps } from './Slider';
import { flattenChildrenArray } from '../utils';


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

interface FullscreenableSliderProps {
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
interface FullscreenableSliderProps extends Omit<
  SliderProps,
  'children' | 'lightboxMode'
> {}
interface FullscreenableSliderProps extends FullscreenableSliderClassNames {}


function FullscreenableSlider({
  children,
  modalLabel,
  itemsPerPage,
  withLightbox,
  className, wrapperClassName,
  slideClassName, activeSlideClassName, visibleSlideClassName,
  previousBtnClassName, nextBtnClassName,
  modalClassName, modalOverlayClassName, modalPortalClassName,
  modalBodyOpenClassName, modalHtmlOpenClassName
}: FullscreenableSliderProps) {
  const [ lightboxIndex, setLightboxIndex ] = useState(-1);
  const childrenArray = flattenChildrenArray(children);

  const body: (boolean | React.ReactChild)[] = [];
  const lightboxBody:(boolean | React.ReactChild)[] = [];

  for (const child of childrenArray) {
    const childEl = child as React.ReactElement;

    switch (childEl.type) {
      case 'video':
        const sources = childEl?.props?.children;
        const lightboxSources = [];
        const mainSources = [];

        if (Array.isArray(sources)) {
          let idx = 0;
          for (const source of sources) {
            if (
              typeof source === 'object' &&
              typeof source.props === 'object'
            ) {
              if (source.props['data-fullscreen']) {
                lightboxSources.push(React.cloneElement(source, {
                  key: `.${idx++}`
                }));

                continue;
              }

              mainSources.push(React.cloneElement(source, {
                key: `.${idx++}`
              }));
            }
          }
        }

        // TODO warn if mainSources empty

        body.push(React.cloneElement(childEl, undefined, mainSources));

        if (lightboxSources.length > 0) {
          lightboxBody.push(React.cloneElement(
            childEl,
            { id: undefined },
            lightboxSources
          ));

          break;
        }

        lightboxBody.push(React.cloneElement(
          childEl,
          { id: undefined },
          mainSources
        ));

        break;
      
      case 'img':
        body.push(child);
        
        lightboxBody.push(React.cloneElement(childEl, {
          id: undefined,
          src: childEl.props['data-fullscreen-src'] || childEl.props.src || '',
          alt: childEl.props['data-fullscreen-alt'] || childEl.props.alt || ''
        }));

        break;
    
      default:
        body.push(child);

        if (isElement(child)) {
          lightboxBody.push(React.cloneElement(childEl, { id: undefined }));

          break;
        }

        switch (typeof child) {
          case 'string':
            lightboxBody.push('' + child);
            break;

          case 'number':
            lightboxBody.push(0 + child);
            break;

          default:
            lightboxBody.push(child);
        }
    }
  }

  return (
    <>
      {withLightbox && lightboxIndex > -1 && (
        <Modal
          isOpen
          contentLabel={modalLabel}
          onRequestClose={() => setLightboxIndex(-1)}
          className={modalClassName}
          overlayClassName={modalOverlayClassName}
          portalClassName={modalPortalClassName}
          bodyOpenClassName={modalBodyOpenClassName}
          htmlOpenClassName={modalHtmlOpenClassName}
        >
          <Slider
            className={className}
            slideClassName={slideClassName}
            activeSlideClassName={activeSlideClassName}
            visibleSlideClassName={visibleSlideClassName}
            wrapperClassName={wrapperClassName}
            previousBtnClassName={previousBtnClassName}
            nextBtnClassName={nextBtnClassName}
            itemsPerPage={itemsPerPage}
            lightboxMode
          >
            {lightboxBody}
          </Slider>
        </Modal>
      )}
      <Slider
        className={className}
        slideClassName={slideClassName}
        activeSlideClassName={activeSlideClassName}
        visibleSlideClassName={visibleSlideClassName}
        wrapperClassName={wrapperClassName}
        previousBtnClassName={previousBtnClassName}
        nextBtnClassName={nextBtnClassName}
        itemsPerPage={itemsPerPage}
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