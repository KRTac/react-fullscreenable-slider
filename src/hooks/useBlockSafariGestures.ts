import { useEffect } from 'react';

import { preventEventDefault } from '../utils';


/**
 * https://use-gesture.netlify.app/docs/gestures/#about-the-pinch-gesture
 */
function useBlockSafariGestures(): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('gesturestart', preventEventDefault);
    document.addEventListener('gesturechange', preventEventDefault);
    document.addEventListener('gestureend', preventEventDefault);

    return () => {
      document.removeEventListener('gesturestart', preventEventDefault);
      document.removeEventListener('gesturechange', preventEventDefault);
      document.removeEventListener('gestureend', preventEventDefault);
    };
  }, []);
}

export default useBlockSafariGestures;
