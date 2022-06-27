import { useEffect } from 'react';
import { setModalAppElement } from '../..';


function ModalHelper({ root }: { root: string }) {
  useEffect(() => setModalAppElement(root), [ root ]);

  return null;
}

export default ModalHelper;
