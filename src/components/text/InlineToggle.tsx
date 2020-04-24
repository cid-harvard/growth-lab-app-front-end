import React, {useState} from 'react';
import DropdownTreeSelect, {TreeNode} from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css';
import './inlineDropdownStyles.scss';

interface Props {
  data: TreeNode[];
  colorClassName?: string;
  onChange?: (val: TreeNode) => void;
}

const InlineToggle = (props: Props) => {
  const {data} = props;

  const [selectedValue, setSelectedValue] = useState<TreeNode>(data[0]);

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
  const selectedClass = selectedValue && selectedValue.label ? 'inline-selected' : '';
  const colorClassName = props.colorClassName ? ' ' + props.colorClassName : '';
  const hideSearch = data.length < 10 ? ' hide-search' : '';

  return (
    <DropdownTreeSelect
      searchPredicate={searchPredicate}
      className={'inline-dropdown ' + selectedClass + colorClassName + hideSearch}
      data={data}
      onChange={onChange}
      mode={'radioSelect'}
      keepTreeOnSearch={true}
      texts={{placeholder}}
      clearSearchOnChange={true}
      inlineSearchInput={true}
    />
  );
};

export default InlineToggle;