import { useEffect, useState } from 'react';


function useViewport(
  activeIndex: number,
  childrenCount: number,
  itemsPerPage: number
): [ number, (index: number) => void ] {
  const [ firstIndex, setFirstIndex ] = useState(activeIndex);

  useEffect(() => {
    const placesBeforeCenter = Math.floor((itemsPerPage - 1) / 2);
    let firstIndex = activeIndex - placesBeforeCenter;

    if (firstIndex + itemsPerPage > childrenCount) {
      firstIndex = childrenCount - itemsPerPage;
    }

    if (firstIndex < 0) {
      firstIndex = 0;
    }

    setFirstIndex(firstIndex);
  }, [ itemsPerPage, childrenCount, activeIndex ]);

  return [ firstIndex, setFirstIndex ];
}

export default useViewport;
