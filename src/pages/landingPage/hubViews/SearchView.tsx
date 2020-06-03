import React, {useState} from 'react';
import BasicSearch from '../../../components/form/BasicSearch';
import {Routes, hubId} from '../../../routing/routes';
import {useHistory} from 'react-router-dom';
import {QueryString} from '../';

interface Props {
  initialQuery: string;
}

const SearchView = (props: Props) => {
  const {initialQuery} = props;
  const history = useHistory();

  const [search, setSearch] = useState<string>(initialQuery);
  console.log(search);

  const setUrl = ({query, keywords}: QueryString) => {
    const baseUrl = Routes.Landing + '#' + hubId;
    if ((!query || !query.length) && (!keywords || !keywords.length) ) {
      history.push(baseUrl);
    } else {
      const queryVar = query && query.length ? 'query=' + query : '';
      let keywordVar = keywords && keywords.length ? 'keywords=' : '';
      if (keywords && keywords.length) {
        keywords.forEach(word => keywordVar = keywordVar + word + ',');
      }
      const seperator = queryVar && keywordVar ? '&' : '';
      const fullUrl = Routes.Landing + '?' + queryVar + seperator + keywordVar + '#' + hubId;
      history.push(fullUrl);
    }
  };
  const setSearchQuery = (val: string) => {
    setSearch(val);
    setUrl({query: val, keywords: undefined});
  };

  return (
    <>
      <BasicSearch
        placeholder={'Search More...'}
        setSearchQuery={setSearchQuery}
        initialQuery={initialQuery}
        focusOnMount={true}
      />
    </>
  );
};

export default SearchView;