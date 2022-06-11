import React, { useMemo } from 'react';

import { filterChildren } from '../utils';


function useFilteredChildren(
  prop: React.ReactNode
) {
  const children = useMemo(() => {
    return filterChildren(prop);
  }, [ prop ]);

  return children;
}

export default useFilteredChildren;
