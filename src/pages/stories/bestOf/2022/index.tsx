import React, {useRef, useEffect} from 'react';
import BestOfTemplate, {SectionDatum} from './Template';
import CoverPhotoImage from './header_image.png';
// TO DO: Need to create low-res version of header image
import CoverPhotoImageLowRes from './header_image.png';
import {get, Routes} from '../../../../metadata';
import data from './2022-12-14_data2022.json';
import {scrollToAnchor} from '../../../../hooks/useScrollBehavior';
import { useLocation } from 'react-router';
import {storyMobileWidth} from '../../../../styling/Grid';
import orderBy from 'lodash/orderBy';


const orderedData = orderBy(data, ['order'], ['asc']);

const BestOf2022 = () =>{
  const section_0 = useRef<HTMLParagraphElement | null>(null);
  const section_1 = useRef<HTMLParagraphElement | null>(null);
  const section_2 = useRef<HTMLParagraphElement | null>(null);
  const section_3 = useRef<HTMLParagraphElement | null>(null);
  const section_4 = useRef<HTMLParagraphElement | null>(null);
  const section_5 = useRef<HTMLParagraphElement | null>(null);
  const section_6 = useRef<HTMLParagraphElement | null>(null);
  const section_7 = useRef<HTMLParagraphElement | null>(null);
  const section_8 = useRef<HTMLParagraphElement | null>(null);
  const section_9 = useRef<HTMLParagraphElement | null>(null);
  const section_10 = useRef<HTMLParagraphElement | null>(null);
  const section_11 = useRef<HTMLParagraphElement | null>(null);
  const section_12 = useRef<HTMLParagraphElement | null>(null);
  const section_13 = useRef<HTMLParagraphElement | null>(null);
  const section_14 = useRef<HTMLParagraphElement | null>(null);
  const section_15 = useRef<HTMLParagraphElement | null>(null);
  const section_16 = useRef<HTMLParagraphElement | null>(null);
  const section_17 = useRef<HTMLParagraphElement | null>(null);
  const sections = [
    section_0,
    section_1,
    section_2,
    section_3,
    section_4,
    section_5,
    section_6,
    section_7,
    section_8,
    section_9,
    section_10,
    section_11,
    section_12,
    section_13,
    section_14,
    section_15,
    section_16,
    section_17,
  ];

  const hasBeenRendered = useRef<boolean>(false);

  const location = useLocation();

  useEffect(() => {
    const anchor = location && location.hash ? location.hash : null;
    const bufferTop = window.innerWidth > storyMobileWidth ? -window.innerHeight * 0.95 : -window.innerHeight * 1.6;
    scrollToAnchor({anchor, bufferTop});
  }, [location.pathname]);

  const metadata = get(Routes.BestOf2022);

  const sectionsData: SectionDatum[] = orderedData.map((d, i) => {
    const source = d.data_source && d.data_source.length 
      ? <><br /><br /><em>Source: {d.data_source}</em></> : null;
    const url = d.research_link_url && d.research_link_url.toLowerCase() !== 'n/a'
      ? d.research_link_url : undefined;
      const linkText = d.research_link_text ? d.research_link_text : undefined;
    return ({
      id: d.hash_id,
      title: d.title,
      text: (<p>{d.description}{source}</p>),
      image: d.image && d.image.length ? require(`./images/${d.image}`) : CoverPhotoImageLowRes,
      linkText,
      url,
      ref: sections[i],
    });
  });

  return (
    <BestOfTemplate
      metaTitle={metadata.title}
      metaDescription={metadata.description}
      coverPhotoSrc={{low: CoverPhotoImageLowRes, high: CoverPhotoImage}}
      pageTitle={'Visual Insights from the Growth Lab’s 2022 Research'}
      dateLine={'December 14, 2022'}
      byLine={null}
      introText={<p>
        In 2022, the Growth Lab’s research agenda spanned five continents. Our researchers tackled development challenges with a diverse group of countries and regions while also working on pressing issues such as Russia’s invasion of Ukraine, green growth, and the future of work in a post-pandemic world. The work of our multi-disciplinary team takes on many forms, including pioneering academic research on the determinants of growth, enabling more sustainable and inclusive growth through place-specific policy engagements, and translating research insights into open-access digital tools. In no particular order, here are our top visual insights of 2022.</p>}
      sectionsData={sectionsData}
      hasBeenRendered={hasBeenRendered}
    />
  );
};

export default BestOf2022;
