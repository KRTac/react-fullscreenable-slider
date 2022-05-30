import React, { useState } from 'react';
import Modal from 'react-modal';
import { isElement } from 'react-is';

import Slider from './Slider';
import { flattenChildrenArray } from '../utils';


interface FullscreenableSliderProps {
  index?: number;
  label?: string;
  disableLightbox?: boolean;
  children?: React.ReactNode;
}

function FullscreenableSlider({
  children,
  label,
  disableLightbox = false
}: FullscreenableSliderProps) {
  const [ lightboxIndex, setLightboxIndex ] = useState(-1);
  const childrenArray = flattenChildrenArray(children);

  const body: React.ReactNode[] = [];
  const lightboxBody: React.ReactNode[] = [];

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
            if (typeof source === 'object' && typeof source.props === 'object') {
              if (source.props['data-fullscreen']) {
                lightboxSources.push(React.cloneElement(source, { key: `.${idx++}` }));

                continue;
              }

              mainSources.push(React.cloneElement(source, { key: `.${idx++}` }));
            }
          }
        }

        // TODO warn if mainSources empty

        body.push(React.cloneElement(childEl, undefined, mainSources));

        if (lightboxSources.length > 0) {
          lightboxBody.push(React.cloneElement(childEl, { id: undefined }, lightboxSources));

          break;
        }

        lightboxBody.push(React.cloneElement(childEl, { id: undefined }, mainSources));

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
      {!disableLightbox && lightboxIndex > -1 && (
        <Modal
          isOpen
          contentLabel={label}
          onRequestClose={() => setLightboxIndex(-1)}
        >
          <Slider>
            {lightboxBody}
          </Slider>
        </Modal>
      )}
      <Slider>
        {body}
      </Slider>
    </>
  );
}

export default FullscreenableSlider;