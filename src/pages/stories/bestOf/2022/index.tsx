import React, {useRef, useEffect} from 'react';
import BestOfTemplate, {SectionDatum} from './Template';
import CoverPhotoImage from './cover-photo.png';
import CoverPhotoImageLowRes from './cover-photo-low-res.jpg';
import {get, Routes} from '../../../../metadata';
import data from './data.json';
import {scrollToAnchor} from '../../../../hooks/useScrollBehavior';
import { useLocation } from 'react-router';
import {storyMobileWidth} from '../../../../styling/Grid';
import orderBy from 'lodash/orderBy';




const orderedData = orderBy(data, ['ORDERING_ON_SITE'], ['asc']);


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
  ];

  const location = useLocation();

  useEffect(() => {
    const anchor = location && location.hash ? location.hash : null;
    const bufferTop = window.innerWidth > storyMobileWidth ? -window.innerHeight * 0.75 : -window.innerHeight * 1.6;
    scrollToAnchor({anchor, bufferTop});
  }, [location]);

  const metadata = get(Routes.BestOf2022);

  const sectionsData: SectionDatum[] = orderedData.filter(d => d.INCLUDE_ON_SITE !== 'NO').map((d, i) => {
    const source = d.DATA_SOURCE && d.DATA_SOURCE.length && d.DATA_SOURCE !== 'WF TO'
      ? <><br /><br /><em>Source: {d.DATA_SOURCE}</em></> : null;
    const url = d.RESEARCH_LINK && d.RESEARCH_LINK && d.RESEARCH_LINK.toLowerCase() !== 'n/a' && d.RESEARCH_LINK !== 'WF Chuck'
      ? d.RESEARCH_LINK : undefined;
      const linkText = d.LINK_TEXT ? d.LINK_TEXT : undefined;
    return ({
      id: d.HASH_ID,
      title: d.TITLE,
      text: (<p>{d.DESCRIPTION}{source}</p>),
      image: d.IMAGE_SRC && d.IMAGE_SRC.length ? require(`./images/${d.IMAGE_SRC}`) : CoverPhotoImageLowRes,
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
      pageTitle={'Visual Insights from the Growth Lab\'s 2022 Research'}
      dateLine={'December 15, 2021'}
      byLine={null}
      introText={<p>The Growth Lab has over 50 faculty, fellows, research assistants, and staff working on development challenges in more than a dozen countries worldwide. Across its multi-disciplinary team, the Growth Lab conducts academic research on the nature of growth as economies build new capabilities, engages in place-based applied research to understand local context-specific growth problems, teaches cutting-edge frameworks to empower current and future policymakers, and builds tools to provide high-definition information for public use. Here are some visual highlights from the Growth Lab’s research in 2022.</p>}
      sectionsData={sectionsData}
    />
  );
};

export default BestOf2022;
