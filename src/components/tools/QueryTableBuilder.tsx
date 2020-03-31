import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {
  baseColor,
  secondaryFont,
  Label,
  SectionHeaderSecondary,
} from '../../styling/styleUtils';
import DropdownTreeSelect, {TreeNode} from 'react-dropdown-tree-select';
import '../navigation/multiTierDropdownStyles.scss';
import {lighten} from 'polished';
import DynamicTable, {
  Column,
  Datum,
} from '../text/DynamicTable';

const Root = styled.div`
  font-family: ${secondaryFont};
  width: 100%;
`;

const DownloadQueryButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

interface DownloadButtonProps {
  primaryColor?: string;
}

const ButtonBase = styled.button<DownloadButtonProps>`
  color: #fff;
  text-align: center;
  font-size: 1.3rem;
  background-color: ${({primaryColor}) => primaryColor ? primaryColor : baseColor};
  padding: 0.7rem 1.2rem;
  font-family: ${secondaryFont};
  margin-bottom: 1rem;
  text-transform: uppercase;

  &:hover {
    background-color: ${({primaryColor}) => primaryColor ? lighten(0.1 ,primaryColor) : baseColor};
  }
`;

const DownloadButton = styled(ButtonBase)`
  margin: 2rem auto 0;
`;

const BuilderContainer = styled.div`
  background-color: #fff;
  padding: 1rem;
`;

const FormContainer = styled.div`
  display: grid;
  grid-auto-rows: auto;
  grid-column-gap: 0.75rem;
`;

const FieldLabel = styled(Label)`
  grid-row: 1;
`;

const InputContainer = styled.div`
  grid-row: 2;
`;

const UpdateButton = styled(ButtonBase)`
  grid-row: 2;
  padding: 0.5rem 1rem;
`;

const Lowercase = styled.span`
  text-transform: none;
`;

const TableContainer = styled.div`
  width: 100%;
  display: grid;
`;

interface SelectData extends TreeNode {
  parentValue?: string | null;
}

interface SelectBoxProps {
  id: string;
  label: string;
  data: SelectData[];
  dependentOn?: string;
  required?: boolean;
}

interface CallbackSelectionDatum {
  id: string;
  value: string;
}

interface CallbackData {
  selectedFields: CallbackSelectionDatum[];
}

interface Props {
  selectFields?: SelectBoxProps[];
  primaryColor: string;
  onUpdateClick: (data: CallbackData) => void;
  onQueryDownloadClick: (data: CallbackData) => void;
  itemName: string;
  columns: Column[];
  tableData: Datum[];
}

const QueryBuilder = (props: Props) => {
  const {
    selectFields, primaryColor, onQueryDownloadClick,
    itemName, onUpdateClick, tableData, columns,
  } = props;

  const [selectedValues, setSelectedValues] = useState<TreeNode[]>(
    selectFields && selectFields.length ? selectFields.map(({data}) => data[0]) : [],
  );


  let searchFieldList: React.ReactNode | null;
  if (selectFields && selectFields.length) {
    searchFieldList = selectFields.map((field, i) => {
      const selectedClass = selectedValues[i] && selectedValues[i].label ? 'mulit-tier-selected' : '';
      const placeholder = selectedValues && selectedValues[i].label ? selectedValues[i].label : 'Type Or Select';

      const onChange = (currentNode: TreeNode, selectedNodes: TreeNode[]) => {
        if (selectedNodes.length) {
          setSelectedValues(
            selectedValues.map((node, j) => {
              if (i === j) {
                return currentNode;
              } else {
                return node;
              }
            }),
          );
        }
        const activeInput = document.activeElement as HTMLElement;
        if (activeInput) {
          activeInput.blur();
        }
      };

      let data: TreeNode[];

      if (field.dependentOn) {
        const parentIndex = selectFields.findIndex(({id}) => id === field.dependentOn);
        const parentDefaultValue = selectFields[parentIndex].data[0].value; // first value is the default value
        const parentSelectedValue = selectedValues[parentIndex].value;
        data = parentSelectedValue === parentDefaultValue
          ? field.data : field.data.filter(d => !d.parentValue || d.parentValue === parentSelectedValue);
      } else {
        data = field.data;
      }

      const label = field.required ? field.label : field.label + ' (Optional)';
      return (
        <React.Fragment key={'select-field-box-' + field.id + i}>
          <FieldLabel>{label}</FieldLabel>
          <InputContainer>
            <DropdownTreeSelect
              className={'multi-tier-dropdown ' + selectedClass}
              data={data}
              mode={'radioSelect'}
              keepTreeOnSearch={true}
              clearSearchOnChange={true}
              texts={{placeholder}}
              onChange={onChange}
            />
          </InputContainer>
        </React.Fragment>
      );
    });
  } else {
    searchFieldList = null;
  }

  const onUpdate = () => {
    const selectFieldValues: CallbackSelectionDatum[] = [];
    selectedValues.forEach(({value}, i) => {
      if (selectFields && selectFields[i]) {
        selectFieldValues.push({id: selectFields[i].id, value});
      }
    });
    onUpdateClick({selectedFields: selectFieldValues});
  };
  const onDownload = () => {
    const selectFieldValues: CallbackSelectionDatum[] = [];
    selectedValues.forEach(({value}, i) => {
      if (selectFields && selectFields[i]) {
        selectFieldValues.push({id: selectFields[i].id, value});
      }
    });
    onQueryDownloadClick({selectedFields: selectFieldValues});
  };

  return (
    <Root>
      <BuilderContainer>
        <FormContainer>
          {searchFieldList}
          <UpdateButton primaryColor={primaryColor} onClick={onUpdate}>
            Update
          </UpdateButton>
        </FormContainer>
        <TableContainer>
          <SectionHeaderSecondary color={primaryColor}>
            Top 10 Preview List
          </SectionHeaderSecondary>
          <DynamicTable
            data={tableData}
            columns={columns}
            stickFirstCol={true}
            hideGridLines={true}
          />
        </TableContainer>
      </BuilderContainer>
      <DownloadQueryButtonContainer>
        <DownloadButton primaryColor={primaryColor} onClick={onDownload}>
          Download Full List <Lowercase>(1200 {itemName})</Lowercase>
        </DownloadButton>
      </DownloadQueryButtonContainer>
    </Root>
  );
};

export default QueryBuilder;