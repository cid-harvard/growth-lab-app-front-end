import React, { createRef, useState, useEffect } from "react";
import { FullWidthHeader } from "../../styling/Grid";
import SplashScreen from "./SplashScreen";
import styled from "styled-components";
import TopLevelNav from "./TopLevelNav";
import useScrollBehavior from "../../hooks/useScrollBehavior";
import {
  activeLinkColor,
  HubContentContainer,
  queryStringToCategory,
  navBackgroundColor as baseNavBackgroundColor,
  backgroundPattern,
} from "./Utils";
import { Grid, NavColumn, ContentColumn } from "./Grid";
import StandardFooter from "../../components/text/StandardFooter";
import { hubId } from "../../routing/routes";
import { navHeight } from "../../components/navigation/TopLevelStickyNav";
import StickySideNav, { View } from "./components/StickySideNav";
import GridView from "./hubViews/GridView";
import ListView from "./hubViews/ListView";
import SearchView from "./hubViews/SearchView";
import { useLocation } from "react-router";
import queryString from "query-string";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import {
  HubProject,
  HubKeyword,
  ProjectCategories,
} from "./graphql/graphQLTypes";
import Loading from "../../components/general/Loading";
import FullPageError from "../../components/general/FullPageError";
import orderBy from "lodash/orderBy";

const GET_ALL_PROJECTS_AND_KEYWORDS = gql`
  query GetAllIndustries {
    hubProjectsList {
      projectName
      link
      projectCategory
      show
      data
      keywords
      cardSize
      announcement
      ordering
      cardImageHi
      cardImageLo
      localFile
      status
      id
    }
    hubKeywordsList {
      keyword
      projects
    }
  }
`;

interface SuccessResponse {
  hubProjectsList: HubProject[];
  hubKeywordsList: HubKeyword[];
}

const SplashScreenContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

// examples: /?query=albania%20tool&keywords=usa,jordan,albania&categories=usa,jordan,albania#hub
export interface QueryString {
  query?: string;
  keywords?: string[];
  categories?: string[];
  dataKeywords?: string[];
  status?: string[];
}

const LandingPage = () => {
  const { search } = useLocation();
  const parsedQuery: QueryString | undefined = queryString.parse(search, {
    arrayFormat: "comma",
  });

  const containerNodeRef = createRef<HTMLDivElement>();

  const [isNavOverContent, setIsNavOverContent] = useState(false);

  const defaultActiveView =
    parsedQuery !== undefined &&
    ((parsedQuery.query !== undefined && parsedQuery.query.length) ||
      (parsedQuery.keywords !== undefined && parsedQuery.keywords.length) ||
      (parsedQuery.categories !== undefined && parsedQuery.categories.length) ||
      (parsedQuery.dataKeywords !== undefined &&
        parsedQuery.dataKeywords.length) ||
      (parsedQuery.status !== undefined && parsedQuery.status.length))
      ? View.search
      : View.grid;
  const [activeView, setActiveView] = useState<View>(defaultActiveView);

  useEffect(() => {
    const cachedRef = containerNodeRef.current as HTMLDivElement,
      observer = new IntersectionObserver(
        ([e]) => setIsNavOverContent(e.isIntersecting),
        { rootMargin: `0px 0px -${window.innerHeight - navHeight * 16}px 0px` },
      );

    observer.observe(cachedRef);

    // unmount
    return () => observer.unobserve(cachedRef);
  }, [containerNodeRef]);

  const linkColor = "#fff";
  const activeColor = activeLinkColor;
  const navBackgroundColor = isNavOverContent
    ? baseNavBackgroundColor
    : "rgba(255, 255, 255, 0.2)";
  const navBackgroundImage = isNavOverContent ? backgroundPattern : undefined;
  useScrollBehavior({
    navAnchors: ["#" + hubId],
    smooth: false,
  });

  const { loading, error, data } = useQuery<SuccessResponse, never>(
    GET_ALL_PROJECTS_AND_KEYWORDS,
  );

  let contentView: React.ReactElement<any> | null;
  if (loading) {
    contentView = <Loading />;
  } else if (error) {
    contentView = <FullPageError message={error.message} />;
  } else if (data !== undefined) {
    const { hubProjectsList, hubKeywordsList } = data;

    if (activeView === View.grid) {
      contentView = <GridView projects={hubProjectsList} />;
    } else if (activeView === View.list) {
      contentView = <ListView projects={hubProjectsList} />;
    } else if (activeView === View.search) {
      const initialQuery =
        parsedQuery && parsedQuery.query !== undefined ? parsedQuery.query : "";
      const initialSelectedKeywords =
        parsedQuery && parsedQuery.keywords !== undefined
          ? parsedQuery.keywords
          : [];
      const initialSelectedCategories =
        parsedQuery && parsedQuery.categories !== undefined
          ? parsedQuery.categories.map(queryStringToCategory)
          : [];
      const initialSelectedDataKeywords =
        parsedQuery && parsedQuery.dataKeywords !== undefined
          ? parsedQuery.dataKeywords
          : [];
      const initialSelectedStatus =
        parsedQuery && parsedQuery.status !== undefined
          ? parsedQuery.status
          : [];

      const sortedKeywords = orderBy(
        hubKeywordsList,
        ({ keyword }) => keyword.toLowerCase(),
        ["asc"],
      );
      const allCategories: ProjectCategories[] = [];
      const allStatuses: string[] = [];
      const allDataKeywords: string[] = [];
      hubProjectsList.forEach((project) => {
        const { projectCategory, status, show } = project;
        if (show) {
          if (
            projectCategory &&
            !allCategories.find((c) => c === projectCategory)
          ) {
            allCategories.push(projectCategory);
          }
          if (status && !allStatuses.find((s) => s === status)) {
            allStatuses.push(status);
          }
          if (project.data && project.data.length) {
            project.data.forEach((d) => {
              if (!allDataKeywords.find((k) => k === d)) {
                allDataKeywords.push(d);
              }
            });
          }
        }
      });

      if (data) {
        contentView = (
          <SearchView
            initialQuery={initialQuery}
            keywords={sortedKeywords}
            initialSelectedKeywords={initialSelectedKeywords}
            categories={allCategories}
            initialSelectedCategories={initialSelectedCategories}
            dataKeywords={allDataKeywords}
            initialSelectedDataKeywords={initialSelectedDataKeywords}
            status={allStatuses}
            initialSelectedStatus={initialSelectedStatus}
            projects={hubProjectsList}
          />
        );
      } else {
        contentView = null;
      }
    } else {
      console.error("Invalid view type " + activeView);
      contentView = null;
    }
  } else {
    contentView = null;
  }

  return (
    <>
      <TopLevelNav
        linkColor={linkColor}
        showTitle={isNavOverContent}
        activeColor={activeColor}
        backgroundColor={navBackgroundColor}
        backgroundImage={navBackgroundImage}
      />
      <FullWidthHeader>
        <SplashScreenContainer>
          <SplashScreen />
        </SplashScreenContainer>
      </FullWidthHeader>
      <HubContentContainer id={hubId} ref={containerNodeRef}>
        <Grid>
          <NavColumn>
            <StickySideNav
              activeView={activeView}
              setActiveView={setActiveView}
            />
          </NavColumn>
          <ContentColumn>{contentView}</ContentColumn>
        </Grid>
      </HubContentContainer>
      <StandardFooter />
    </>
  );
};

export default LandingPage;
