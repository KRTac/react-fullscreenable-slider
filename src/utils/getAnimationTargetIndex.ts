export default function getAnimationTargetIndex(target: HTMLElement, items: (HTMLElement | null)[]) {
  let eventTargetIndex = -1;

  while (target) {
    eventTargetIndex = items.indexOf(target)
    if (eventTargetIndex > -1) {
      break;
    }

    target = target.parentElement as HTMLElement;
  }

  return eventTargetIndex;
}
