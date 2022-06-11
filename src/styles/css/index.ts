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
  nextBtnClassName: 'rrslider-next-btn'
};

export function getClassNameProps(): SliderClassNames {
  return CSS_PROPS;
}
