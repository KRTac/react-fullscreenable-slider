import React from 'react';
import { isFragment, isPortal } from 'react-is';


export default function flattenChildrenArray(children: React.ReactNode): (React.ReactChild | boolean)[] {
  let flattened: React.ReactNode[] = [];

  if (Array.isArray(children)) {
    for (const child of children) {
      if (child === undefined || child === null || isPortal(child)) {
        // TODO warn about portal usage
        continue;
      }

      if (isFragment(child)) {
        if (
          child.props &&
          Array.isArray(child.props.children) &&
          child.props.children.length > 0
        ) {
          flattened = [...flattened, ...flattenChildrenArray(child.props.children)];
        }

        continue;
      }

      flattened.push(child);
    }
  }

  return <(React.ReactChild | boolean)[]> React.Children.toArray(flattened);
}
