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

const testData = [
  {
    label: 'Agriculture',
    value: 'A',
    className: 'no-select-parent',
    disabled: true,
    children: [
      {
        label: 'Corn',
        value: 'A1',
        disabled: false,
      },
      {
        label: 'Potatoes',
        value: 'A2',
        disabled: false,
      },
      {
        label: 'Lettuce',
        value: 'A3',
        disabled: false,
      },
    ],
  },
  {
    label: 'Technology',
    value: 'B',
    className: 'no-select-parent',
    disabled: true,
    children: [
      {
        label: 'Computers',
        value: 'B1',
        disabled: false,
      },
      {
        label: 'Cars',
        value: 'B2',
        disabled: false,
      },
      {
        label: 'Phones',
        value: 'B3',
        disabled: false,
      },
    ],
  },
  {
    label: 'Minerals',
    value: 'C',
    className: 'no-select-parent',
    disabled: true,
    children: [
      {
        label: 'Gold',
        value: 'C1',
        disabled: false,
      },
      {
        label: 'Diamonds',
        value: 'C2',
        disabled: false,
      },
      {
        label: 'Coal',
        value: 'C3',
        disabled: false,
      },
    ],
  },
  {
    label: 'Services',
    value: 'D',
    className: 'no-select-parent',
    disabled: true,
    children: [
      {
        label: 'Tourism',
        value: 'D1',
        disabled: false,
      },
      {
        label: 'Consulting',
        value: 'D2',
        disabled: false,
      },
      {
        label: 'Other',
        value: 'D3',
        disabled: false,
      },
    ],
  },
];

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
  searchLabelTest: string;
}

interface Node {
  label: string;
  value: string;
}

const HeaderWithSearch = (props: Props) => {
  const {title, searchLabelTest} = props;

  const [selectedValue, setSelectedValue] = useState<Node | undefined>(undefined);

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
        <Label>{searchLabelTest}</Label>
        <DropdownTreeSelect
          searchPredicate={searchPredicate}
          className={'multi-tier-dropdown ' + selectedClass}
          data={testData}
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