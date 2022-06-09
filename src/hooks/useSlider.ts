import { useEffect } from 'react';
import { useSpring } from '@react-spring/web';


function useSlider(
  firstIndex: number,
  itemDim: number
) {
  const [ props, api ] = useSpring(() => ({ x: 0 }));

  useEffect(() => {
    if (itemDim <= 0) {
      return;
    }

    api.start({
      x: firstIndex * -itemDim
    });
  }, [ firstIndex, itemDim ]);

  return [ props ]
}

export default useSlider;
