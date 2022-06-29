import { useEffect } from 'react';
import { setModalAppElement } from '../..';


function ModalHelper({ appRoot }: { appRoot: string }) {
  useEffect(() => setModalAppElement(appRoot), [ appRoot ]);

  return null;
}

export default ModalHelper;
