import { FullscreenableSliderClassNames } from '../../components/FullscreenableSlider';
import './style.css';


const CSS_PROPS = {
  className: {
    base: 'fullscreenable-slider',
    fullscreen: 'fullscreenable-slider fullscreen'
  },
  slideClassName: 'slide-wrapper',
  previousBtnClassName: 'prev-btn',
  nextBtnClassName: 'next-btn'
};

export function getClassNameProps(): FullscreenableSliderClassNames {
  return CSS_PROPS;
}
