import {useEffect, useState, MutableRefObject} from 'react';

interface Options {
  refs: MutableRefObject<HTMLElement | null>[];
}

export default ({refs}: Options) => {
  const [section, setSection] = useState<number | null>(null);

  useEffect(() => {
    const windowHeight = window.innerHeight;
    const handleScroll = () => {
      const sectionTops = refs.map(node => node && node.current ? node.current.getBoundingClientRect().top + window.scrollY : 0);
      const windowPosition = window.scrollY + (windowHeight * 0.5);
      const currentSection = sectionTops.findIndex((n, i) => windowPosition > n &&
          (i === sectionTops.length - 1 || windowPosition < sectionTops[i + 1]));
      const newSection = currentSection === -1 ? null : currentSection;
      if (newSection !== section) {
        setSection(newSection);
      }
    };
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [refs, section]);

  return {section};
};
