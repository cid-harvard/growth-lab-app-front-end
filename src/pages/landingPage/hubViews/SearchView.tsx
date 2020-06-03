import React, {useState} from 'react';
import BasicSearch from '../../../components/form/BasicSearch';
import {Routes, hubId} from '../../../routing/routes';
import {useHistory} from 'react-router-dom';
import {QueryString} from '../';
import styled from 'styled-components/macro';
import {
  Label,
  baseColor,
  lightBaseColor,
  lightBorderColor,
  secondaryFont,
} from '../../../styling/styleUtils';
import {activeLinkColor} from '../Utils';

const KeywordsGrid = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 2rem;

  @media (max-width: 590px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto;
  }
`;

const CheckboxTitle = styled.h3`
  font-family: ${secondaryFont};
  color: ${activeLinkColor};
  text-transform: uppercase;
  grid-column: 1 / -1;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 0.75rem;
`;

const KeywordContainer = styled.div`
  font-size: 0.85rem;
`;

const CategoryContainer = styled.div`
  margin-bottom: 0.85rem;
  text-transform: uppercase;
`;

interface CheckboxLabelProps {
  checked: boolean;
  primaryColor: string;
  size: number; // in rem
}

const CheckboxLabel = styled(Label)<CheckboxLabelProps>`
  display: flex;
  cursor: pointer;

  &:before {
    content: '✔';
    flex-shrink: 0;
    width: ${({size}) => size * 0.85}rem;
    height: ${({size}) => size * 0.85}rem;
    font-size: ${({size}) => size}rem;
    color: ${({checked}) => checked ? baseColor : 'rgba(0, 0, 0, 0)'};
    background-color: ${({checked, primaryColor}) => checked ? primaryColor : lightBorderColor};
    border: 1px solid ${lightBaseColor};
    margin-right: 0.6rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  input {
    display: none;
  }
`;


interface CheckboxProps {
  label: string;
  value: string;
  checked: boolean;
}

interface Props {
  initialQuery: string;
  keywords: string[];
  initialSelectedKeywords: string[];
  categories: string[];
  initialSelectedCategories: string[];
}

const SearchView = (props: Props) => {
  const {initialQuery, initialSelectedKeywords, initialSelectedCategories} = props;
  const history = useHistory();

  const keywordCheckboxes: CheckboxProps[] = props.keywords.map(keyword => {
    const checked = !!initialSelectedKeywords.find((value) => value.toLowerCase() === keyword.toLowerCase());
    return {label: keyword, value: keyword.toLowerCase(), checked};
  });
  const categoriesCheckboxes: CheckboxProps[] = props.categories.map(category => {
    const checked = !!initialSelectedCategories.find((value) => value.toLowerCase() === category.toLowerCase());
    return {label: category, value: category.toLowerCase(), checked};
  });

  const [search, setSearch] = useState<string>(initialQuery);
  const [keywordValues, setKeywordValues] = useState<CheckboxProps[]>(keywordCheckboxes);
  const [categoriesValues, setCategoriesValues] = useState<CheckboxProps[]>(categoriesCheckboxes);

  const setUrl = ({query, keywords, categories}: QueryString) => {
    const baseUrl = Routes.Landing + '#' + hubId;
    if ((!query || !query.length) && (!keywords || !keywords.length)  && (!categories || !categories.length)) {
      history.push(baseUrl);
    } else {
      const queryVar = query && query.length ? 'query=' + query : '';
      let keywordVar = keywords && keywords.length ? 'keywords=' : '';
      if (keywords && keywords.length) {
        keywords.forEach(word => keywordVar = keywordVar + word + ',');
      }
      let categoriesVar = categories && categories.length ? 'categories=' : '';
      if (categories && categories.length) {
        categories.forEach(word => categoriesVar = categoriesVar + word + ',');
      }
      const firstSeperator = queryVar && (keywordVar || categoriesVar) ? '&' : '';
      const secondSeperator = keywordVar && categoriesVar ? '&' : '';
      const fullUrl =
        Routes.Landing + '?' + queryVar + firstSeperator + keywordVar + secondSeperator + categoriesVar + '#' + hubId;
      history.push(fullUrl);
    }
  };
  const setSearchQuery = (val: string) => {
    setSearch(val);
    setUrl({
      query: val,
      keywords: keywordValues.filter(({checked}) => checked).map(({value}) => value),
      categories: categoriesValues.filter(({checked}) => checked).map(({value}) => value),
    });
  };

  let keywordList: React.ReactNode | null;
  if (keywordValues && keywordValues.length) {
    keywordList = keywordValues.map((checkbox, i) => {

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const newKeywordValues = keywordValues.map((c, j) => {
          if (i === j) {
            return {...c, checked};
          } else {
            return c;
          }
        });
        setKeywordValues(newKeywordValues);
        setUrl({
          query: search,
          keywords: newKeywordValues.filter((v) => v.checked).map(({value}) => value),
          categories: categoriesValues.filter((v) => v.checked).map(({value}) => value),
        });
      };

      return (
        <KeywordContainer key={'checkbox-field-' + checkbox.value + i}>
          <CheckboxLabel
            checked={checkbox.checked}
            primaryColor={activeLinkColor}
            size={1}
          >
            <input type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
            {checkbox.label}
          </CheckboxLabel>
        </KeywordContainer>
      );
    });
  } else {
    keywordList = null;
  }

  let categoriesList: React.ReactNode | null;
  if (categoriesValues && categoriesValues.length) {
    categoriesList = categoriesValues.map((checkbox, i) => {

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const newCategoriesValues = categoriesValues.map((c, j) => {
          if (i === j) {
            return {...c, checked};
          } else {
            return c;
          }
        });
        setCategoriesValues(newCategoriesValues);
        setUrl({
          query: search,
          keywords: keywordValues.filter((v) => v.checked).map(({value}) => value),
          categories: newCategoriesValues.filter((v) => v.checked).map(({value}) => value),
        });
      };

      return (
        <CategoryContainer key={'checkbox-field-' + checkbox.value + i}>
          <CheckboxLabel
            checked={checkbox.checked}
            primaryColor={activeLinkColor}
            size={1.2}
          >
            <input type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
            {checkbox.label}
          </CheckboxLabel>
        </CategoryContainer>
      );
    });
  } else {
    categoriesList = null;
  }

  const titleSearchQuery = search ? search : '[anything]';

  const selectedCategories = categoriesValues.filter(({checked}) => checked);
  const selectedCategoryList = selectedCategories.length ? selectedCategories.map(({value}) => (
    <li key={value}>{value}</li>
  )) : <li>[any category]</li>;

  const selectedKeywords = keywordValues.filter(({checked}) => checked);
  const selectedKeywordList = selectedKeywords.length ? selectedKeywords.map(({value}) => (
    <li key={value}>{value}</li>
  )) : <li>[any keywords]</li>;

  return (
    <>
      <BasicSearch
        placeholder={'Search More...'}
        setSearchQuery={setSearchQuery}
        initialQuery={initialQuery}
        focusOnMount={true}
        searchBarStyleOverrides={{
          backgroundColor: 'transparent',
          textTransform: 'uppercase',
          fontFamily: secondaryFont,
          border: '1px solid #666',
          outline: 'none',
          padding: '1rem 8px 1rem 2.5rem',
        }}
      />
      <KeywordsGrid>
        <div>
          <CheckboxTitle>Categories</CheckboxTitle>
          {categoriesList}
        </div>
        <CheckboxGrid>
          <CheckboxTitle>Other Keywords</CheckboxTitle>
          {keywordList}
        </CheckboxGrid>
      </KeywordsGrid>
      <p style={{marginTop: '2rem'}}>
        Currently Searching for projects WHERE
      </p>
      <p>
        <strong>title</strong> CONTAINS <strong>{titleSearchQuery}</strong> (case insensitive)
      </p>
      <p>
        AND <strong>category</strong> IS EQUAL TO ANY OF (case insensitive)
      </p>
      <ul>
        {selectedCategoryList}
      </ul>
      <p>
        AND <strong>keywords</strong> INCLUDE ALL OF (case insensitive)
      </p>
      <ul>
        {selectedKeywordList}
      </ul>
    </>
  );
};

export default SearchView;