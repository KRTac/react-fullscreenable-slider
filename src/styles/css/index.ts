import { FullscreenableSliderClassNames } from '../../components/FullscreenableSlider';
import './style.css';


const CSS_PROPS: FullscreenableSliderClassNames = {
  className: {
    base: 'fullscreenable-slider',
    fullscreen: 'fullscreenable-slider fullscreen'
  },
  slideClassName: 'slide-wrapper',
  activeSlideClassName: 'active',
  visibleSlideClassName: 'visible',
  wrapperClassName: 'slider',
  previousBtnClassName: 'prev-btn',
  nextBtnClassName: 'next-btn'
};

export function getClassNameProps(): FullscreenableSliderClassNames {
  return CSS_PROPS;
}
