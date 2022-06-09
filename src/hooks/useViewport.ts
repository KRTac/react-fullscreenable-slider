import { useEffect, useRef, useState } from 'react';


function useViewport(
  activeIndex: number,
  childrenCount: number,
  itemsPerPage: number
): [ number, (index: number) => void ] {
  const [ firstIndex, setFirstIndex ] = useState(activeIndex);
  const lastActiveIndex = useRef(activeIndex);

  useEffect(() => {
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
  }, [ itemsPerPage, childrenCount, activeIndex ]);

  useEffect(() => {
    lastActiveIndex.current = activeIndex;
  }, [ activeIndex ]);

  return [ firstIndex, setFirstIndex ];
}

export default useViewport;
