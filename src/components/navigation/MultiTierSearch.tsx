import React, {useState, useEffect} from 'react';
import {
  Label,
} from '../../styling/styleUtils';
import styled from 'styled-components';
import DropdownTreeSelect, {TreeNode} from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';
import './multiTierDropdownStyles.scss';

const SearchContainer = styled.div`
  max-width: 400px;
  margin: auto;
  text-align: center;
`;

const SearchLabel = styled(Label)`
  text-transform: uppercase;
  margin-bottom: 0.65rem;
`;

interface Props {
  searchLabelText: string;
  data: TreeNode[];
  initialSelectedValue?: TreeNode;
  onChange?: (val: TreeNode) => void;
}

const HeaderWithSearch = (props: Props) => {
  const {searchLabelText, data, initialSelectedValue} = props;

  const [selectedValue, setSelectedValue] = useState<TreeNode | undefined>(initialSelectedValue);

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

  useEffect(() => {
    if (initialSelectedValue !== undefined && selectedValue !== undefined &&
        initialSelectedValue.value !== selectedValue.value)
      setSelectedValue(initialSelectedValue);
  }, [initialSelectedValue, selectedValue, setSelectedValue]);

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
    <SearchContainer>
      <SearchLabel>{searchLabelText}</SearchLabel>
      <DropdownTreeSelect
        searchPredicate={searchPredicate}
        className={'multi-tier-dropdown ' + selectedClass}
        data={data}
        onChange={onChange}
        mode={'radioSelect'}
        keepTreeOnSearch={false}
        texts={{placeholder}}
        clearSearchOnChange={true}
      />
    </SearchContainer>
  );
};

export default HeaderWithSearch;