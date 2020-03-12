import React, {useState, useEffect} from 'react';
import {
  StandardH1,
  Label,
} from '../../styling/styleUtils';
import { Header } from '../../styling/Grid';
import styled from 'styled-components';
import DropdownTreeSelect, {TreeNode} from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';
import './multiTierDropdownStyles.scss';

const Root = styled(Header)`
  padding-bottom: 2rem;
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: auto;
  text-align: center;
`;

interface Props {
  title: string;
  searchLabelText: string;
  data: TreeNode[];
  onChange?: (val: TreeNode) => void;
}

const HeaderWithSearch = (props: Props) => {
  const {title, searchLabelText, data} = props;

  const [selectedValue, setSelectedValue] = useState<TreeNode | undefined>(undefined);

  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      const focusedElm: HTMLElement | null = document.querySelector('.no-select-parent.disabled.focused i');
      if (focusedElm && e.keyCode === 13) {
        focusedElm.click();
      }
    };
    window.addEventListener('keydown', keydownListener);
    return () => window.removeEventListener('keydown', keydownListener);
  });

  const onChange = (currentNode: TreeNode, selectedNodes: TreeNode[]) => {
    if (selectedNodes.length) {
      setSelectedValue(currentNode);
      if (props.onChange) {
        props.onChange(currentNode);
      }
    }
    const activeInput = document.activeElement as HTMLElement;
    if (activeInput) {
      activeInput.blur();
    }
  };

  const searchPredicate = (node: TreeNode, searchTerm: string) => {
    return ((node.label && node.label.toLowerCase().indexOf(searchTerm) >= 0) &&
           !(node.className && node.className.includes('no-select-parent'))) ||
           searchTerm === ''
           ? true : false;
  };

  const placeholder = selectedValue && selectedValue.label ? selectedValue.label : 'Type Or Select';
  const selectedClass = selectedValue && selectedValue.label ? 'mulit-tier-selected' : '';
  return (
    <Root>
      <StandardH1>{title}</StandardH1>
      <SearchContainer>
        <Label>{searchLabelText}</Label>
        <DropdownTreeSelect
          searchPredicate={searchPredicate}
          className={'multi-tier-dropdown ' + selectedClass}
          data={data}
          onChange={onChange}
          mode={'radioSelect'}
          keepTreeOnSearch={true}
          texts={{placeholder}}
          clearSearchOnChange={true}
        />
      </SearchContainer>
    </Root>
  );
};

export default HeaderWithSearch;