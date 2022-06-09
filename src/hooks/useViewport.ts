import { useEffect, useRef, useState } from 'react';


function useViewport(
  activeIndex: number,
  childrenCount: number,
  itemsPerPage: number,
  wasDragging: React.MutableRefObject<boolean | undefined>
): [ number, (index: number) => void ] {
  const [ firstIndex, setFirstIndex ] = useState(activeIndex);
  const lastActiveIndex = useRef(activeIndex);

  useEffect(() => {
    if (wasDragging.current !== undefined) {
      return;
    }

    let placesBeforeCenter = Math.floor((itemsPerPage - 1) / 2);

    if (lastActiveIndex.current < activeIndex) {
      // going up
      placesBeforeCenter = Math.ceil((itemsPerPage - 1) / 2);
    }

    let firstIndex = activeIndex - placesBeforeCenter;

    if (firstIndex + itemsPerPage > childrenCount) {
      firstIndex = childrenCount - itemsPerPage;
    }

    if (firstIndex < 0) {
      firstIndex = 0;
    }

    setFirstIndex(firstIndex);
  }, [ itemsPerPage, childrenCount, activeIndex, wasDragging ]);

  useEffect(() => {
    lastActiveIndex.current = activeIndex;
  }, [ activeIndex ]);

  return [ firstIndex, setFirstIndex ];
}

export default useViewport;
