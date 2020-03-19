import { useEffect } from 'react';
import { useLocation} from 'react-router';

interface Options {
  bufferTop?: number;
  navAnchors?: string[];
}

const useScrollBehavior = (options?: Options) => {
  const location = useLocation();

  useEffect(() => {
    const elm: HTMLElement | null = document.querySelector(location.hash);
    const bufferTop = options && options.bufferTop ? options.bufferTop : 0;
    if (elm) {
      window.scrollTo({
        top: elm.offsetTop - bufferTop,
        left: 0,
        behavior: 'smooth',
      });
    }
  });
};

export default useScrollBehavior;