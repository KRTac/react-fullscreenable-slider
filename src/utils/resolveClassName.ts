import { SliderClassNameStates } from '../components/Slider';


export default function resolveClassName(
  className: string | SliderClassNameStates | undefined,
  isLightbox: boolean | undefined
): string | undefined {
  if (typeof className === 'object') {
    if (isLightbox) {
      return className.fullscreen;
    }

    return className.base;
  }

  return className;
}
