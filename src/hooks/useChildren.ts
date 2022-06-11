import React, { useMemo } from 'react';

import { filterChildren } from '../utils';


function useChildren(
  prop: React.ReactNode
) {
  const children = useMemo(() => {
    return filterChildren(prop);
  }, [ prop ]);

  return children;
}

export default useChildren;
