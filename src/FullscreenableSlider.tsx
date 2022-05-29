import React, { useState } from 'react';
import Modal from 'react-modal';

import Slider from './Slider';


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

  return (
    <>
      {!disableLightbox && lightboxIndex > -1 && (
        <Modal
          isOpen
          contentLabel={label}
          onRequestClose={() => setLightboxIndex(-1)}
        >
          <Slider>
            <p>Lightbox</p>
          </Slider>
        </Modal>
      )}
      <Slider>
        {children}
      </Slider>
    </>
  );
}

export default FullscreenableSlider;