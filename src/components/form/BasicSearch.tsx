import { debounce } from 'lodash';
import React, { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
  lightBaseColor,
} from '../../styling/styleUtils';
import { AppContext } from '../../App';

const SearchContainer = styled.label`
  position: relative;
  display: flex;
`;

const magnifyingGlassSize = 1.5; // in rem
const magnifyingGlassSpacing = 0.5; // in rem

const SearchIcon = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto ${magnifyingGlassSpacing}rem;
  font-size: ${magnifyingGlassSize}rem;
  color: ${lightBaseColor};
  cursor: pointer;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 8px 8px 8px ${magnifyingGlassSize + (magnifyingGlassSpacing * 2)}rem;
  box-sizing: border-box;
  border: solid 1px ${lightBorderColor};
  box-shadow: 0px 0px 3px -1px #b5b5b5;
  font-size: 1.2rem;
  font-weight: 300;

  &::placeholder {
    color: ${lightBaseColor};
  }
`;

interface Props {
  placeholder: string;
  setSearchQuery: (value: string) => void;
  initialQuery: string;
  focusOnMount: boolean;
}

const StandardSearch = (props: Props) => {
  const { placeholder, setSearchQuery, initialQuery, focusOnMount } = props;

  const searchEl = useRef<HTMLInputElement | null>(null);
  const { windowWidth } = useContext(AppContext);

  const onChange = debounce(() => {
    if (searchEl !== null && searchEl.current !== null) {
      setSearchQuery(searchEl.current.value);
    }
  }, 400);

  useEffect(() => {
    const node = searchEl.current;
    if (node) {
      if (focusOnMount === true && windowWidth > 1024) {
        node.focus();
      }
      if (!node.value) {
        node.value = initialQuery;
      }
    }
  }, [searchEl, focusOnMount, windowWidth, initialQuery]);

  return (
    <SearchContainer>
      <SearchIcon />
      <SearchBar
        ref={searchEl}
        type='text'
        placeholder={placeholder}
        onChange={onChange}
        autoComplete={'off'}
      />
    </SearchContainer>
  );
};

export default StandardSearch;
