import React, { useRef, useEffect } from "react";
import BestOfTemplate, { SectionDatum } from "./Template";
import CoverPhotoImage from "./header_image.png";
import CoverPhotoImageLowRes from "./header_image.png";
import { get, Routes } from "../../../../metadata";
import data from "./bestviz_2024-Sheet1.json";
import { scrollToAnchor } from "../../../../hooks/useScrollBehavior";
import { useLocation } from "react-router";
import { storyMobileWidth } from "../../../../styling/Grid";

const BestOf2024 = () => {
  // Create refs for each section based on the data length
  const sections = useRef<Array<React.RefObject<HTMLParagraphElement>>>(
    Array(data.length)
      .fill(null)
      .map(() => React.createRef()),
  );

  const hasBeenRendered = useRef<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const anchor = location && location.hash ? location.hash : null;
    const bufferTop =
      window.innerWidth > storyMobileWidth
        ? -window.innerHeight * 0.95
        : -window.innerHeight * 1.6;
    scrollToAnchor({ anchor, bufferTop });
  }, [location.pathname]);

  const metadata = get(Routes.BestOf2024);

  const sectionsData: SectionDatum[] = data.map((d, i) => {
    const source =
      d.source && d.source.length ? (
        <>
          <br />
          <br />
          <em>Source: {d.source}</em>
        </>
      ) : null;
    const url = d.link && d.link.length ? d.link : undefined;

    return {
      id: d.hash_id || `viz-${i + 1}`,
      title: d.title,
      text: (
        <p>
          {d.text}
          {source}
        </p>
      ),
      image: require(`./images/${d.image}`),
      // d.image && d.image.length
      //   ? require(`./images/${d.image}`)
      //   : CoverPhotoImageLowRes,
      linkText: undefined,
      url,
      ref: sections.current[i],
    };
  });

  return (
    <BestOfTemplate
      metaTitle={metadata.title}
      metaDescription={metadata.description}
      coverPhotoSrc={{ low: CoverPhotoImageLowRes, high: CoverPhotoImage }}
      pageTitle={"Visual Insights from the Growth Lab's 2024 Research"}
      dateLine={"December 11, 2024"}
      byLine={null}
      introText={
        <p>
          In 2024, the Growth Lab’s research agenda continues to span multiple
          continents, addressing critical economic growth and development
          challenges across diverse regions. Our researchers have focused on
          pressing issues, including water sustainability, gender equality in
          employment, green growth, and regional economic development. It’s our
          mission to collaborate with policymakers and share our insights with
          the world through teaching, publications, and open-access digital
          tools. In this spirit, here are some visual insights from our research
          in 2024.
        </p>
      }
      sectionsData={sectionsData}
      hasBeenRendered={hasBeenRendered}
    />
  );
};

export default BestOf2024;
