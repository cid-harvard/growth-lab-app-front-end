import React, {useRef, useEffect} from 'react';
import BestOfTemplate, {SectionDatum} from '../Template';
import CoverPhotoImage from './cover-photo.png';
import CoverPhotoImageLowRes from './cover-photo-low-res.jpg';
import {get, Routes} from '../../../../metadata';
import data from './data.json';
import {scrollToAnchor} from '../../../../hooks/useScrollBehavior';
import { useLocation } from 'react-router';
import {storyMobileWidth} from '../../../../styling/Grid';
import orderBy from 'lodash/orderBy';

const orderedData = orderBy(data, ['ORDERING'], ['asc']);


const BestOf2020 = () =>{
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
  const section_18 = useRef<HTMLParagraphElement | null>(null);
  const section_19 = useRef<HTMLParagraphElement | null>(null);
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
    section_18,
    section_19,
  ];

  const location = useLocation();

  useEffect(() => {
    const anchor = location && location.hash ? location.hash : null;
    const bufferTop = window.innerWidth > storyMobileWidth ? -window.innerHeight * 0.75 : -window.innerHeight * 1.6;
    scrollToAnchor({anchor, bufferTop});
  }, [location]);

  const metadata = get(Routes.BestOf2020);

  const sectionsData: SectionDatum[] = orderedData.map((d, i) => {
    const source = d.DATA_SOURCE && d.DATA_SOURCE.length && d.DATA_SOURCE !== 'WF TO'
      ? <><br /><br /><em>Source: {d.DATA_SOURCE}</em></> : null;
    const url = d.RESEARCH_LINK && d.RESEARCH_LINK && d.RESEARCH_LINK !== 'n/a' && d.RESEARCH_LINK !== 'WF Chuck'
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
      pageTitle={'20 Visual Insights from the Growth Lab in 2020'}
      dateLine={'December 15, 2020'}
      byLine={null}
      introText={<p>The Growth Lab has over 50 faculty, fellows, research assistants, and staff working on development challenges in more than a dozen countries worldwide. Our research in 2020 included modeling pandemic-related tradeoffs, mapping the network of global business travel, identifying foreign exchange constraints in Ethiopia, tracking the migration of the Albanian diaspora, and uncovering environmentally friendly diversification opportunities in Peru. Every project, paper, and presentation brought hundreds of charts, graphics, dashboards, and prototypes. We thought it would be worthwhile to share some of our more notable visual insights from this year.</p>}
      sectionsData={sectionsData}
    />
  );
};

export default BestOf2020;
