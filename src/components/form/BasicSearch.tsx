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
  width: 30px;
  height: 100%;
  margin: auto ${magnifyingGlassSpacing}rem;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 19.8'%3E%3Cg class='cls-1' fill='%23666'%3E%3Cpath class='cls-2' d='M4,14,0,18l1.8,1.8,4-4A5.17,5.17,0,0,1,4,14' transform='translate(0 0)'/%3E%3Cpath class='cls-2' d='M11.7,15.2a6.92,6.92,0,0,1-6.8-7,6.77,6.77,0,0,1,6.64-6.9h.16a6.94,6.94,0,0,1,7,6.88v0a7.15,7.15,0,0,1-7,7M11.7,0A8.15,8.15,0,0,0,3.6,8.2h0a8.17,8.17,0,0,0,8,8.3h.06A8.41,8.41,0,0,0,20,8.2,8.26,8.26,0,0,0,11.7,0' transform='translate(0 0)' /%3E%3C/g%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-position: 5px center;
  background-size: 20px;
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
  searchBarStyleOverrides?: React.CSSProperties;
}

const StandardSearch = (props: Props) => {
  const { placeholder, setSearchQuery, initialQuery, focusOnMount, searchBarStyleOverrides } = props;

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
        style={searchBarStyleOverrides}
      />
    </SearchContainer>
  );
};

export default StandardSearch;
