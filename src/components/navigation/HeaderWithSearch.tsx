import React from 'react';
import {
  StandardH1,
  Label,
} from '../../styling/styleUtils';
import { Header } from '../../styling/Grid';
import styled from 'styled-components';

const Root = styled(Header)`
  padding-bottom: 2rem;
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: auto;
  text-align: center;
`;

const InputPlaceholder = styled.input`
  width: 100%;
  font-size: 1rem;
  padding: 0.5rem 0.5rem;
  box-sizing: border-box;

  &::placeholder {
    text-transform: uppercase;
  }
`;

interface Props {
  title: string;
  searchLabelTest: string;
}

const HeaderWithSearch = (props: Props) => {
  const {title, searchLabelTest} = props;
  return (
    <Root>
      <StandardH1>{title}</StandardH1>
      <SearchContainer>
        <Label>{searchLabelTest}</Label>
        <InputPlaceholder type='text' placeholder='Type or Select' />
      </SearchContainer>
    </Root>
  );
}

export default HeaderWithSearch;