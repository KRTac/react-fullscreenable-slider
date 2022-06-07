export default function getAnimationTargetIndex(target: HTMLElement, items: (HTMLElement | null)[]) {
  let eventTargetIndex = -1;
  let currentTarget = target;

  while (currentTarget) {
    eventTargetIndex = items.indexOf(currentTarget)
    if (eventTargetIndex > -1) {
      break;
    }

    currentTarget = currentTarget.parentElement as HTMLElement;
  }

  if (eventTargetIndex === -1 && target.children.length === 1) {
    eventTargetIndex = items.indexOf(target.children[0] as HTMLElement);
  }

  return eventTargetIndex;
}
