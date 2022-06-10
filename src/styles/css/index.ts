import { FullscreenableSliderClassNames } from '../../components/FullscreenableSlider';
import './style.css';


const CSS_PROPS: FullscreenableSliderClassNames = {
  className: {
    base: 'rrslider-root',
    fullscreen: 'rrslider-root fullscreen'
  },
  slideClassName: 'rrslider-slide-wrapper',
  activeSlideClassName: 'active',
  visibleSlideClassName: 'visible',
  wrapperClassName: 'rrslider-slider',
  previousBtnClassName: 'rrslider-prev-btn',
  nextBtnClassName: 'rrslider-next-btn'
};

export function getClassNameProps(): FullscreenableSliderClassNames {
  return CSS_PROPS;
}
