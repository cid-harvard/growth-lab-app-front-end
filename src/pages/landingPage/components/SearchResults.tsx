import React, {useState, useEffect} from 'react';
import ListView from '../hubViews/ListView';
import styled from 'styled-components/macro';
import {
  HubProject,
} from '../graphql/graphQLTypes';
import Loading from '../../../components/general/Loading';

const Root = styled.div`
  min-height: 100vh;
`;

const SearchResults = ({projects, projectsKey}: {projects: HubProject[], projectsKey: string}) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  }, [projectsKey]);

  const results = loading ? <Loading /> : <ListView projects={projects} />;

  return (
    <Root>
      {results}
    </Root>
  );
};

export default React.memo(SearchResults);

