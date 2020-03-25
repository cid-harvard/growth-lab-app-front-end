import React, {useState, useContext, useRef, useEffect} from 'react';
import styled from 'styled-components/macro';
import {
  SectionHeaderSecondary,
  baseColor,
  lightBaseColor,
  lightBorderColor,
  secondaryFont,
  Label,
  labelMarginBottom,
} from '../../styling/styleUtils';
import DropdownTreeSelect, {TreeNode} from 'react-dropdown-tree-select';
import '../navigation/multiTierDropdownStyles.scss';
import { AppContext } from '../../App';

const Root = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-column-gap: 2rem;
  font-family: ${secondaryFont};

  @media (max-width: 1000px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto;
    text-align: center;
  }
`;

const DownloadAllColumn = styled.div`
  grid-column: 1;
  display: flex;
  flex-direction: column;
  max-width: 300px;

  @media (max-width: 1000px) {
    max-width: 100%;
  }
`;

const DownloadAllButtonContainer = styled.div`
  text-align: center;
  margin: auto 0;
`;

const DownloadQueryButtonContainer = styled.div`
  grid-column: 1 / -1;
  margin: 2rem 0;
`;

const OrColumn = styled.div`
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  text-transform: uppercase;
  font-size: 1.1rem;

  &:before,
  &:after {
    content: '';
    width: 0;
    height: 80%;
    border-right: 1px solid ${baseColor};
    margin: 0 auto;
  }

  &:before {
    margin-bottom: auto;
  }

  &:after {
    margin-top: auto;
  }


  @media (max-width: 1000px) {
    grid-template-rows: auto;
    grid-template-columns: 1fr auto 1fr;

    &:before,
    &:after {
      content: '';
      width: 80%;
      height: 0;
      border-top: 1px solid ${baseColor};
      border-right: none;
      margin: auto;
    }
  }
`;

interface DownloadButtonProps {
  hoverColor?: string;
}

const DownloadButton = styled.button<DownloadButtonProps>`
  color: #fff;
  text-align: center;
  font-size: 1.3rem;
  border: 1px solid ${baseColor};
  color: ${baseColor};
  padding: 0.7rem 1.2rem;
  font-family: ${secondaryFont};
  margin-bottom: 1rem;

  &:hover {
    color: #fff;
    background-color: ${({hoverColor}) => hoverColor ? hoverColor : baseColor};
    border-color: ${({hoverColor}) => hoverColor ? hoverColor : baseColor};
  }
`;

const builderColumnSmallWidthSize = 600; // in px

const BuilderColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 180px;
  grid-column-gap: 2rem;

  @media (max-width: ${builderColumnSmallWidthSize}px) {
    grid-template-columns: 1;
    grid-template-rows: auto auto;
  }
`;

const SelectListContainer = styled.div`
  margin-bottom: 1rem;
  text-align: left;
`;
const CheckboxContainer = styled.div`
  margin-bottom: 1rem;
  text-align: left;
`;

interface CheckboxLabelProps {
  checked: boolean;
  primaryColor: string;
}

const CheckboxLabel = styled(Label)<CheckboxLabelProps>`
  display: flex;
  cursor: pointer;

  &:before {
    content: '✔';
    flex-shrink: 0;
    width: 1rem;
    height: 1rem;
    font-size: 1.4rem;
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

const SectionHeader = styled(SectionHeaderSecondary)`
  text-transform: none;
`;

interface FullDownloadProps {
  label: string;
  onClick: () => void;
}

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

interface CheckboxProps {
  label: string;
  value: string | number;
  checked: boolean;
}

interface CallbackSelectionDatum {
  id: string;
  value: string;
}

interface CallbackData {
  selectedFields: CallbackSelectionDatum[];
  checkboxValues: CheckboxProps[];
}

interface Props {
  title: string;
  fullDownload?: FullDownloadProps;
  selectFields?: SelectBoxProps[];
  checkboxTitle?: string;
  checkboxes?: CheckboxProps[];
  primaryColor: string;
  onQueryDownloadClick: (data: CallbackData) => void;
  hoverColor?: string;
}

const QueryBuilder = (props: Props) => {
  const {
    title, fullDownload, selectFields, checkboxes, primaryColor, onQueryDownloadClick,
    hoverColor, checkboxTitle,
  } = props;
  const { windowWidth } = useContext(AppContext);

  const [selectedValues, setSelectedValues] = useState<TreeNode[]>(
    selectFields && selectFields.length ? selectFields.map(({data}) => data[0]) : [],
  );
  const [checkboxMarginTop, setCheckboxMarginTop] = useState<number | undefined>(undefined);
  const [checkboxValues, setCheckboxValues] = useState<CheckboxProps[]>(checkboxes ? checkboxes : []);

  const firstSelectBoxLabelNodeRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    if (!checkboxTitle && firstSelectBoxLabelNodeRef && firstSelectBoxLabelNodeRef.current) {
      const node = firstSelectBoxLabelNodeRef.current;
      if (checkboxMarginTop === undefined) {
        setCheckboxMarginTop(node.clientHeight + (labelMarginBottom * 16));
      }
    }
  }, [checkboxTitle, firstSelectBoxLabelNodeRef, checkboxMarginTop, setCheckboxMarginTop]);

  let fullDownloadColumn: React.ReactElement<any> | null;
  if (fullDownload) {
    const orColumn = (selectFields || checkboxes) ? (<OrColumn>Or</OrColumn>) : null;
    const style: React.CSSProperties = !(selectFields || checkboxes) ? {
      maxWidth: '100%',
      gridColumn: '1 / -1',
      textAlign: 'center',
    } : {};
    fullDownloadColumn = (
      <>
        <DownloadAllColumn style={style}>
          <SectionHeader>{fullDownload.label}</SectionHeader>
          <DownloadAllButtonContainer>
            <DownloadButton hoverColor={hoverColor} onClick={fullDownload.onClick}>Download</DownloadButton>
          </DownloadAllButtonContainer>
        </DownloadAllColumn>
        {orColumn}
      </>
    );
  } else {
    fullDownloadColumn = null;
  }

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
      const ref = i === 0 ? firstSelectBoxLabelNodeRef : undefined;
      return (
        <SelectListContainer key={'select-field-box-' + field.id + i}>
          <Label ref={ref}>{label}</Label>
          <DropdownTreeSelect
            className={'multi-tier-dropdown ' + selectedClass}
            data={data}
            mode={'radioSelect'}
            keepTreeOnSearch={true}
            clearSearchOnChange={true}
            texts={{placeholder}}
            onChange={onChange}
          />
        </SelectListContainer>
      );
    });
  } else {
    searchFieldList = null;
  }

  let checkboxList: React.ReactNode | null;
  if (checkboxValues && checkboxValues.length) {
    checkboxList = checkboxValues.map((checkbox, i) => {

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const newCheckboxValues = checkboxValues.map((c, j) => {
          if (i === j) {
            return {...c, checked};
          } else {
            return c;
          }
        });
        setCheckboxValues(newCheckboxValues);
      };

      return (
        <CheckboxContainer key={'checkbox-field-' + checkbox.value + i}>
          <CheckboxLabel checked={checkbox.checked} primaryColor={primaryColor}>
            <input type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
            {checkbox.label}
          </CheckboxLabel>
        </CheckboxContainer>
      );
    });
  } else {
    checkboxList = null;
  }

  let builderColumn: React.ReactElement<any> | null;
  if (searchFieldList || checkboxList) {
    const searchElm = searchFieldList ? (
      <div style={{gridColumn: checkboxList && windowWidth >= 600 ? 1 : '1 / -1'}}>
        {searchFieldList}
      </div>
    ) : null;
    const checkboxTitleEl = checkboxTitle ? (
      <CheckboxContainer>
        <Label>{checkboxTitle}</Label>
      </CheckboxContainer>
    ) : null;
    const checkboxElm = checkboxList ? (
      <div style={{
        gridColumn: searchFieldList && windowWidth >= 600 ? 2 : '1 / -1',
        marginTop: checkboxMarginTop,
      }}>
        {checkboxTitleEl}
        {checkboxList}
      </div>
    ) : null;

    const onClick = () => {
      const selectFieldValues: CallbackSelectionDatum[] = [];
      selectedValues.forEach(({value}, i) => {
        if (selectFields && selectFields[i]) {
          selectFieldValues.push({id: selectFields[i].id, value});
        }
      });
      onQueryDownloadClick({selectedFields: selectFieldValues, checkboxValues});
    };

    const gridColumn = !fullDownload ? '1 / -1' : undefined;

    builderColumn = (
      <BuilderColumn style={{gridColumn}}>
        <SectionHeader>{title}</SectionHeader>
        {searchElm}
        {checkboxElm}
        <DownloadQueryButtonContainer>
          <DownloadButton hoverColor={hoverColor} onClick={onClick}>Download</DownloadButton>
        </DownloadQueryButtonContainer>
      </BuilderColumn>
    );
  } else {
    builderColumn = null;
  }

  return (
    <Root>
      {fullDownloadColumn}
      {builderColumn}
    </Root>
  );
};

export default QueryBuilder;