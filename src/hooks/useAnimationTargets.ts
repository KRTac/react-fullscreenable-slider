import { useEffect, useRef } from 'react';


function useAnimationTargets(numberOfChildren: number) {
  const targets = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (numberOfChildren <= 0) {
      targets.current = [];

      return;
    }

    targets.current = targets.current.slice(0, numberOfChildren);
  }, [ numberOfChildren ]);

  return targets;
}

export default useAnimationTargets;
