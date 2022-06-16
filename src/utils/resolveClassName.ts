import { SliderClassNameStates } from '../components/SliderComponent';


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
