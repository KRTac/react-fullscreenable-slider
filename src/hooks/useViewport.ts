import { useEffect, useRef, useState } from 'react';

import { isVisibleIndex } from '../utils';


function useViewport(
  activeIndex: number,
  childrenCount: number,
  itemsPerPage: number,
  wasDragging: React.MutableRefObject<boolean | undefined>,
  navigationTarget: 'items' | 'slide',
  navLock: React.MutableRefObject<boolean>
): [ number, (index: number) => void ] {
  const [ firstIndex, setFirstIndex ] = useState(activeIndex);

  const firstIndexRef = useRef(firstIndex);
  firstIndexRef.current = firstIndex;

  useEffect(() => {
    if (wasDragging.current !== undefined) {
      return;
    }

    if (navigationTarget === 'items') {
      if (
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

      return;
    }

    if (navLock.current) {
      navLock.current = false;

      return;
    }

    let newFirst = activeIndex;
    const maxFirstIndex = childrenCount <= itemsPerPage
      ? 0
      : childrenCount - itemsPerPage;

    if (newFirst > maxFirstIndex) {
      newFirst = maxFirstIndex;
    }

    setFirstIndex(newFirst);
  }, [
    itemsPerPage, childrenCount, activeIndex, wasDragging, navigationTarget,
    navLock
  ]);

  return [ firstIndex, setFirstIndex ];
}

export default useViewport;
