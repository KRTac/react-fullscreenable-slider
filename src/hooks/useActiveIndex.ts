import { useCallback, useEffect, useState } from 'react';
import useLatest from '@react-hook/latest';


function useActiveIndex(
  childrenCount: number,
  prop: number,
  onChange?: (index: number) => any
): [ number, (index: number) => void ] {
  const [ activeIndex, setState ] = useState(prop);
  const callback = useLatest(onChange);
  const childCount = useLatest(childrenCount);

  const setActiveIndex = useCallback((index: number) => {
    index = index % childCount.current;

    if (index < 0) {
      index = childCount.current + index;
    }

    if (callback.current) {
      callback.current(index);

      return;
    }

    setState(index);
  }, [ callback, childCount ]);

  useEffect(() => {
    setState(prop);
  }, [ prop ]);

  return [ activeIndex, setActiveIndex ];
}

export default useActiveIndex;
