import { SliderClassNames } from '../../components/Slider';
import './style.css';


const CSS_PROPS: SliderClassNames = {
  className: {
    base: 'rrslider-root',
    fullscreen: 'rrslider-root fullscreen'
  },
  slideClassName: 'rrslider-slide-wrapper',
  activeSlideClassName: 'active',
  visibleSlideClassName: 'visible',
  wrapperClassName: 'rrslider-slider',
  previousBtnClassName: 'rrslider-prev-btn',
  nextBtnClassName: 'rrslider-next-btn',
  modalOverlayClassName: 'rrslider-overlay',
  modalClassName: 'rrslider-modal'
};

export function getClassNameProps(append?: string): SliderClassNames {
  const classNames = {
    className: {
      base: 'rrslider-root',
      fullscreen: 'rrslider-root fullscreen'
    },
    slideClassName: 'rrslider-slide-wrapper',
    activeSlideClassName: 'active',
    visibleSlideClassName: 'visible',
    wrapperClassName: 'rrslider-slider',
    previousBtnClassName: 'rrslider-prev-btn',
    nextBtnClassName: 'rrslider-next-btn',
    modalOverlayClassName: 'rrslider-overlay',
    modalClassName: 'rrslider-modal'
  };

  if (append) {
    classNames.className.base += ' ' + append
    classNames.className.fullscreen += ' ' + append
  }

  return classNames;
}
