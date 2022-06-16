import { SliderClassNames } from '../../components/Slider';
import './style.css';


const CSS_PROPS: SliderClassNames = {
  className: {
    base: 'rrslider-root',
    fullscreen: 'rrslider-root fullscreen'
  },
  slideClassName: 'rrslider-slide-wrapper',
  activeSlideClassName: {
    base: 'active',
    fullscreen: ''
  },
  visibleSlideClassName: {
    base: 'visible',
    fullscreen: ''
  },
  wrapperClassName: 'rrslider-slider',
  previousBtnClassName: 'rrslider-prev-btn',
  nextBtnClassName: 'rrslider-next-btn',
  modalOverlayClassName: 'rrslider-overlay',
  modalClassName: 'rrslider-modal'
};

export function getClassNameProps(): SliderClassNames {
  return CSS_PROPS;
}
