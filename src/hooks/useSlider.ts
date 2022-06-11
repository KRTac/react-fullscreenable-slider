import { useEffect, useRef } from 'react';
import { SpringRef, SpringValue, useSpring } from '@react-spring/web';


function useSlider(
  activeIndex: number,
  firstIndex: number,
  itemDim: number,
  wasDragging: React.MutableRefObject<boolean | undefined>,
  childrenCount: number,
  itemsPerPage: number,
  setFirstIndex: (index: number) => void,
  setActiveIndex: (index: number) => void
): [ { x: SpringValue<number>; }, SpringRef<{ x: number; }> ] {
  // onChange reference doesn't get updated, using a ref as a way around it
  const itemDimRef = useRef(itemDim);
  const childCountRef = useRef(childrenCount);

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const itemsPerPageRef = useRef(itemsPerPage);
  itemsPerPageRef.current = itemsPerPage;

  const [ props, api ] = useSpring(() => ({
    x: 0,
    onChange: ({ value }) => {
      if (wasDragging.current === undefined) {
        return;
      }

      const newFirstIndex = Math.round(Math.abs(value.x) / itemDimRef.current);
      let newActive = undefined;

      if (activeIndexRef.current < newFirstIndex) {
        newActive = newFirstIndex
      } else if (
        activeIndexRef.current >= newFirstIndex + itemsPerPageRef.current
      ) {
        newActive = newFirstIndex + itemsPerPageRef.current - 1;
      }

      setFirstIndex(newFirstIndex);

      if (newActive !== undefined) {
        setActiveIndex(newActive);
      }
    },
    onRest: () => {
      if (wasDragging.current === true) {
        wasDragging.current = undefined;
      }
    }
  }));

  useEffect(() => {
    if (itemDim <= 0) {
      return;
    }

    if (
      wasDragging.current !== undefined &&
      itemDimRef.current === itemDim &&
      childCountRef.current === childrenCount
    ) {
      return;
    }

    wasDragging.current = undefined;

    api.start({
      x: firstIndex * -itemDim
    });
  }, [ firstIndex, itemDim, childrenCount, wasDragging ]);

  useEffect(() => {
    itemDimRef.current = itemDim;
    childCountRef.current = childrenCount;
  });

  return [ props, api ];
}

export default useSlider;
