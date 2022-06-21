import { useMemo } from 'react';
import useLatest from '@react-hook/latest';
import useChange from '@react-hook/change';

import { isVisibleIndex } from '../utils';


function useNavigation(
  navigationTarget: 'items' | 'slide',
  activeIndex: number,
  setActiveIndex: (index: number) => any,
  firstIndex: number,
  setFirstIndex: (index: number) => any,
  itemsPerPage: number,
  childrenCount: number,
  navLock: React.MutableRefObject<boolean>,
  navigationTriggers: any[]
): [ () => void, () => void ] {
  const latestActive = useLatest(activeIndex);
  const latestFirst = useLatest(firstIndex);

  const navigation = useMemo<[ () => void, () => void ]>(() => {
    function navigate(delta: number) {
      if (navigationTarget === 'items') {
        setActiveIndex(latestActive.current + delta)

        return;
      }

      let newFirst = latestFirst.current + delta;
      const maxFirst = childrenCount - itemsPerPage;

      if (newFirst < 0) {
        newFirst = maxFirst;
      } else if (newFirst > maxFirst) {
        newFirst = 0;
      }

      const maxVisible = newFirst + itemsPerPage - 1;

      navLock.current = false;

      if (!isVisibleIndex(latestActive.current, newFirst, itemsPerPage)) {
        if (latestActive.current < newFirst) {
          navLock.current = true;
          setActiveIndex(newFirst);
        } else if (latestActive.current > maxVisible) {
          navLock.current = true;
          setActiveIndex(maxVisible);
        }
      }

      setFirstIndex(newFirst);
    }

    return [ () => navigate(-1), () => navigate(1) ];
  }, [
    navigationTarget, latestActive, latestFirst, itemsPerPage, childrenCount,
    navLock
  ]);

  useChange(navigationTriggers[0], navigation[0]);
  useChange(navigationTriggers[1], navigation[1]);

  return navigation;
}

export default useNavigation;
