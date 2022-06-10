import { useEffect, useRef, useState } from 'react';

import { isVisibleIndex } from '../utils';


function useViewport(
  activeIndex: number,
  childrenCount: number,
  itemsPerPage: number,
  wasDragging: React.MutableRefObject<boolean | undefined>
): [ number, (index: number) => void ] {
  const [ firstIndex, setFirstIndex ] = useState(activeIndex);
  const lastActiveIndex = useRef(activeIndex);

  const firstIndexRef = useRef(firstIndex);
  firstIndexRef.current = firstIndex;

  useEffect(() => {
    if (
      wasDragging.current !== undefined ||
      isVisibleIndex(activeIndex, firstIndexRef.current, itemsPerPage)
    ) {
      return;
    }

    let newFirst = activeIndex;

    if (activeIndex >= firstIndexRef.current + itemsPerPage) {
      newFirst = activeIndex - itemsPerPage + 1;

      if (newFirst < 0) {
        newFirst = 0;
      }
    }

    setFirstIndex(newFirst);
  }, [ itemsPerPage, childrenCount, activeIndex, wasDragging ]);

  useEffect(() => {
    lastActiveIndex.current = activeIndex;
  }, [ activeIndex ]);

  return [ firstIndex, setFirstIndex ];
}

export default useViewport;
