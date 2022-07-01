import { SpringRef, SpringValue } from '@react-spring/web';
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react';

import { getAnimationTargetIndex } from '../utils';
import { useAnimationTargets } from './';


const useGestureCustom = createUseGesture([ dragAction, pinchAction ]);

function useGestures(
  sliderRef: React.MutableRefObject<HTMLDivElement | null>,
  itemDim: number,
  childrenCount: number,
  itemsPerPage: number,
  animationTargets: ReturnType<typeof useAnimationTargets>,
  itemSpringStyles: {
    scale: SpringValue<number>;
    x: SpringValue<number>;
    y: SpringValue<number>;
  }[],
  itemSprings: SpringRef<{
    x: number;
    y: number;
    scale: number;
  }>,
  sliderStyles: { x: SpringValue<number>; },
  sliderApi: SpringRef<{ x: number; }>,
  wasDragging: React.MutableRefObject<boolean | undefined>,
  withScaling?: boolean
) {
  useGestureCustom(
    {
      onDrag: ({
        down, movement, velocity, pinching, cancel, memo, target, offset
      }) => {
        if (pinching || itemDim <= 0 || childrenCount === 0) {
          return cancel();
        }

        let targetScale = 1;
        const eventTargetIndex = getAnimationTargetIndex(
          target as HTMLElement,
          animationTargets.current
        );
        
        if (itemSpringStyles[eventTargetIndex]) {
          targetScale = itemSpringStyles[eventTargetIndex].scale.get();
        }

        if (targetScale > 1) {
          if (!memo) {
            memo = {
              x: itemSpringStyles[eventTargetIndex].x.get(),
              y: itemSpringStyles[eventTargetIndex].y.get()
            };
          }

          itemSprings.start(idx => {
            if (idx === eventTargetIndex) {
              return {
                x: memo.x + movement[0],
                y: memo.y + movement[1],
                immediate: down
              };
            }
          });

          return down ? memo : undefined;
        }

        let movementDelta = offset[0];

        if (down) {
          wasDragging.current = false;
        } else {
          let newFirstIndex = Math.round(Math.abs(movementDelta) / itemDim);
          const speedBasedDelta = Math.round(velocity[0] / 2);

          newFirstIndex += movement[0] < 0 ? speedBasedDelta : -speedBasedDelta;
        
          if (newFirstIndex > childrenCount - itemsPerPage) {
            newFirstIndex = childrenCount - itemsPerPage;
          }

          if (newFirstIndex < 0) {
            newFirstIndex = 0;
          }

          movementDelta = itemDim * -newFirstIndex;

          if (wasDragging.current === false) {
            wasDragging.current = true;
          }
        }

        if (wasDragging.current !== undefined) {
          sliderApi.start({
            x: movementDelta,
            immediate: down
          });
        }
      },
      onPinch: ({
        origin: [ ox, oy ], first, movement: [ ms ],
        offset: [ scale ], memo, cancel, active, target
      }) => {
        if (
          !withScaling ||
          animationTargets.current.length === 0 ||
          !sliderRef.current
        ) {
          return cancel();
        }

        const eventTargetIndex = getAnimationTargetIndex(
          target as HTMLElement,
          animationTargets.current
        );
        const eventTarget = animationTargets.current[eventTargetIndex];

        if (eventTarget && first) {
          const { width, height, x, y } = eventTarget.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [
            itemSpringStyles[eventTargetIndex].x.get(),
            itemSpringStyles[eventTargetIndex].y.get(),
            tx, ty
          ];
        }

        let x = memo[0] - (ms - 1) * memo[2];
        let y = memo[1] - (ms - 1) * memo[3];

        if (scale < .7) {
          scale = .7;
        }

        if (!active && scale < 1.1) {
          x = 0;
          y = 0;
          scale = 1;
        }

        itemSprings.start((idx: number) => {
          if (idx === eventTargetIndex) {
            return { scale, x, y };
          }
        });

        return memo;
      }
    },
    {
      target: sliderRef,
      eventOptions: { capture: false, passive: false },
      drag: {
        filterTaps: true,
        preventDefault: true,
        // @ts-ignore
        bounds: ({ target }) => {
          const eventTargetIndex = getAnimationTargetIndex(
            target as HTMLElement,
            animationTargets.current
          );

          if (
            animationTargets.current[eventTargetIndex] &&
            itemSpringStyles[eventTargetIndex] &&
            itemSpringStyles[eventTargetIndex].scale.get() !== 1
          ) {
            const bounds = {
              top: -Infinity, bottom: Infinity,
              left: -Infinity, right: Infinity
            };

            return bounds;
          }

          let left = itemDim * childrenCount - itemDim * itemsPerPage;

          if (left <= 0) {
            left = 0;
          } else {
            left = -left;
          }

          return { top: 0, bottom: 0, right: 0, left };
        },
        rubberband: true,
        from: ({ target }) => {
          const eventTargetIndex = getAnimationTargetIndex(
            target as HTMLElement,
            animationTargets.current
          );

          if (
            animationTargets.current[eventTargetIndex] &&
            itemSpringStyles[eventTargetIndex] &&
            itemSpringStyles[eventTargetIndex].scale.get() !== 1
          ) {
            return [ 0, 0 ];
          }

          return [ sliderStyles.x.get(), 0 ];
        }
      },
      pinch: {
        scaleBounds: { min: .7, max: 5 }
      }
    }
  );

  return;
}

export default useGestures;
