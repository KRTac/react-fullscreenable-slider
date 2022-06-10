import { SpringRef, SpringValue, useSprings } from '@react-spring/web';
import { useEffect } from 'react';

import { isVisibleIndex } from '../utils';


function useItemSprings(
  childrenCount: number,
  firstIndex: number,
  itemsPerPage: number
): [
  {
    x: SpringValue<number>;
    y: SpringValue<number>;
    scale: SpringValue<number>;
  }[],
  SpringRef<{
    x: number;
    y: number;
    scale: number;
  }>
] {
  const [ itemSpringStyles, itemSprings ] = useSprings(childrenCount, () => ({
    x: 0,
    y: 0,
    scale: 1
  }));

  useEffect(() => {
    itemSprings.start(idx => {
      if (!isVisibleIndex(idx, firstIndex, itemsPerPage)) {
        return {
          x: 0,
          y: 0,
          scale: 1
        };
      }
    });
  }, [ itemSprings, firstIndex, itemsPerPage ]);

  return [ itemSpringStyles, itemSprings ];
}

export default useItemSprings;
