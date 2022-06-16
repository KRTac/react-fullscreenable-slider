import { useCallback, useEffect, useRef, useState } from 'react';
import useLatest from '@react-hook/latest';


function useIndex(
  childrenCount: number,
  prop?: number,
  onChange?: (index?: number) => any
): [ number | undefined, (index?: number) => void ] {
  const [ state, setState ] = useState(prop);
  const callback = useLatest(onChange);
  const childCount = useLatest(childrenCount);

  const setIndex = useCallback((index?: number) => {
    if (typeof index === 'number') {
      index = index % childCount.current;

      if (index < 0) {
        index = childCount.current + index;
      }
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

  return [ state, setIndex ];
}

export default useIndex;
