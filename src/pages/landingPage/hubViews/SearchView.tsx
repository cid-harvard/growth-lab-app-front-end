import React, {useState} from 'react';
import BasicSearch from '../../../components/form/BasicSearch';
import {Routes, hubId} from '../../../routing/routes';
import {useNavigate} from 'react-router-dom';
import {QueryString} from '../';
import styled from 'styled-components';
import {
  Label,
  secondaryFont,
} from '../../../styling/styleUtils';
import {getCategoryString, backgroundGray} from '../Utils';
import {
  HubProject,
  HubKeyword,
  ProjectCategories,
} from '../graphql/graphQLTypes';
import {rgba} from 'polished';
import SearchResults from '../components/SearchResults';

const Root = styled.div`
  margin: 0 0 4rem 3.25rem;
`;

const KeywordsGrid = styled.div`
  margin-top: 1rem;
  display: grid;
  grid-template-columns: auto auto auto;
  grid-column-gap: 2.5rem;

  @media (max-width: 950px) {
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
  }

  @media (max-width: 590px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto;
  }
`;

const CategoriesContainer = styled.div`
  @media (max-width: 950px) {
    grid-column: 1 / -1;
  }
`;

const CheckboxTitle = styled.h3`
  font-family: ${secondaryFont};
  color: ${backgroundGray};
  text-transform: uppercase;
  grid-column: 1 / -1;
  border-bottom: solid 4px ${backgroundGray};
  display: inline-block;
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-column-gap: 0.75rem;

  @media (max-width: 500px) {
    grid-template-columns: auto;
  }
`;

const KeywordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const KeywordContainer = styled.div`
  font-size: 0.85rem;
  margin-right: 0.6rem;
`;

const CategoryContainer = styled.div`
  margin-bottom: 0.85rem;
  text-transform: uppercase;
`;
const AttributeContainer = styled.div`
  margin-bottom: 0.85rem;
`;
const StatusContainer = styled(AttributeContainer)`
  text-transform: capitalize;
`;

const CheckboxLabel = styled(Label)`
  cursor: pointer;

  &:hover span {
    border-bottom: solid 1px #333;
  }
`;

const CheckboxBase = styled.input`
  opacity: 0;
  width: 0;
  border: none;
`;

const UnselectedCheckbox = styled(CheckboxBase)`
  &:focus + span {
    border-bottom: solid 1px #333;
  }
`;

const TagContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  align-self: center;
`;
const TagLabel = styled(Label)`
  font-size: 1rem;
  border-radius: 400px;
  padding: 0.5rem 0.6rem;
  margin-bottom: 0;
  display: flex;
  align-items: center;

  &:after {
    content: '×';
    line-height: 0;
    margin-left: 0.4rem;
    font-size: 1.4rem;
    display: block;
    color: ${backgroundGray};
  }

  &:hover {
    cursor: pointer;
    background-color: ${rgba(backgroundGray, 0.3)};

    &:after {
      color: #333;
    }
  }
`;

const SelectedCheckbox = styled(CheckboxBase)`
  &:focus + span {
    border-bottom: solid 1px #333;
  }
`;


interface CheckboxProps {
  label: string;
  value: string;
  checked: boolean;
}

interface Props {
  initialQuery: string;
  keywords: HubKeyword[];
  initialSelectedKeywords: string[];
  categories: ProjectCategories[];
  initialSelectedCategories: ProjectCategories[];
  dataKeywords: string[];
  initialSelectedDataKeywords: string[];
  status: string[];
  initialSelectedStatus: string[];
  projects: HubProject[];
}

const SearchView = (props: Props) => {
  const {
    initialQuery, initialSelectedKeywords, initialSelectedCategories,
    initialSelectedDataKeywords, initialSelectedStatus, projects,
  } = props;
  const navigate = useNavigate();

  const keywordCheckboxes: CheckboxProps[] = props.keywords.map(({keyword, projects: count}) => {
    const checked = !!initialSelectedKeywords.find((value) => value.toLowerCase() === keyword.toLowerCase());
    const numProjects = count ? count : 0;
    return {label: keyword + `(${numProjects})`, value: keyword.toLowerCase(), checked};
  });
  const categoriesCheckboxes: CheckboxProps[] = props.categories.map(category => {
    const checked = !!initialSelectedCategories.find((value) => value.toLowerCase() === category.toLowerCase());
    return {label: getCategoryString(category), value: category.toLowerCase(), checked};
  });
  const dataKeywordsCheckboxes: CheckboxProps[] = props.dataKeywords.map(dataKeywords => {
    const checked = !!initialSelectedDataKeywords.find((value) => value.toLowerCase() === dataKeywords.toLowerCase());
    return {label: dataKeywords, value: dataKeywords.toLowerCase(), checked};
  });
  const statusCheckboxes: CheckboxProps[] = props.status.map(s => {
    const checked = !!initialSelectedStatus.find((value) => value.toLowerCase() === s.toLowerCase());
    return {label: s, value: s.toLowerCase(), checked};
  });

  const [search, setSearch] = useState<string>(initialQuery);
  const [keywordValues, setKeywordValues] = useState<CheckboxProps[]>(keywordCheckboxes);
  const [categoriesValues, setCategoriesValues] = useState<CheckboxProps[]>(categoriesCheckboxes);
  const [dataKeywordsValues, setDataKeywordsValues] = useState<CheckboxProps[]>(dataKeywordsCheckboxes);
  const [statusValues, setStatusValues] = useState<CheckboxProps[]>(statusCheckboxes);

  const setUrl = ({query, keywords, categories, dataKeywords, status}: QueryString) => {
    const baseUrl = Routes.Landing + '#' + hubId;
    if ((!query || !query.length) && (!keywords || !keywords.length)  && (!categories || !categories.length) &&
        (!dataKeywords || !dataKeywords.length) && (!status || !status.length)
      ) {
      navigate(baseUrl);
    } else {
      const queryVar = query && query.length ? 'query=' + encodeURIComponent(query) + '&' : '';
      let keywordVar = keywords && keywords.length ? 'keywords=' : '';
      if (keywords && keywords.length) {
        keywords.forEach(word => keywordVar = keywordVar + encodeURIComponent(word) + ',');
      }
      keywordVar = keywordVar && keywordVar.length ? keywordVar + '&' : keywordVar;
      let categoriesVar = categories && categories.length ? 'categories=' : '';
      if (categories && categories.length) {
        categories.forEach(word => categoriesVar = categoriesVar + encodeURIComponent(word) + ',');
      }
      categoriesVar = categoriesVar && categoriesVar.length ? categoriesVar + '&' : categoriesVar;
      let dataKeywordsVar = dataKeywords && dataKeywords.length ? 'dataKeywords=' : '';
      if (dataKeywords && dataKeywords.length) {
        dataKeywords.forEach(word => dataKeywordsVar = dataKeywordsVar + encodeURIComponent(word) + ',');
      }
      dataKeywordsVar = dataKeywords && dataKeywords.length ? dataKeywordsVar + '&' : dataKeywordsVar;
      let statusVar = status && status.length ? 'status=' : '';
      if (status && status.length) {
        status.forEach(word => statusVar = statusVar + encodeURIComponent(word) + ',');
      }
      statusVar = statusVar && statusVar.length ? statusVar + '&' : statusVar;
      const fullUrl =
        Routes.Landing +
            '?' +
            queryVar +
            keywordVar +
            categoriesVar +
            dataKeywordsVar +
            statusVar +
            '#' + hubId;
      navigate(fullUrl);
    }
  };
  const setSearchQuery = (val: string) => {
    setSearch(val);
    setUrl({
      query: val,
      keywords: keywordValues.filter(({checked}) => checked).map(({value}) => value),
      categories: categoriesValues.filter(({checked}) => checked).map(({value}) => value),
      dataKeywords: dataKeywordsValues.filter(({checked}) => checked).map(({value}) => value),
      status: statusValues.filter(({checked}) => checked).map(({value}) => value),
    });
  };

  const selectedKeywordList: React.ReactNode[] = [];
  const keywordList: React.ReactNode[] = [];
  const selectedKeywordValues: string[] = [];
  if (keywordValues && keywordValues.length) {
    keywordValues.forEach((checkbox, i) => {

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
          dataKeywords: dataKeywordsValues.filter((v) => v.checked).map(({value}) => value),
          status: statusValues.filter((v) => v.checked).map(({value}) => value),
        });
      };


      if (checkbox.checked) {
        selectedKeywordValues.push(checkbox.value);
        selectedKeywordList.push(
          <TagContainer key={'checkbox-field-' + checkbox.value + i}>
            <TagLabel>
              <SelectedCheckbox type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
              <span dangerouslySetInnerHTML={{__html: checkbox.label}} />
            </TagLabel>
          </TagContainer>,
        );
        return null;
      } else {
        keywordList.push(
          <KeywordContainer key={'checkbox-field-' + checkbox.value + i}>
            <CheckboxLabel>
              <UnselectedCheckbox type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
              <span>{checkbox.label},</span>
            </CheckboxLabel>
          </KeywordContainer>,
        );
      }

    });
  }

  const selectedCategoryList: React.ReactNode[] = [];
  const categoriesList: React.ReactNode[] = [];
  const selectedCategoriesValues: string[] = [];
  if (categoriesValues && categoriesValues.length) {
    categoriesValues.forEach((checkbox, i) => {

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
          dataKeywords: dataKeywordsValues.filter((v) => v.checked).map(({value}) => value),
          status: statusValues.filter((v) => v.checked).map(({value}) => value),
        });
      };


      if (checkbox.checked) {
        selectedCategoriesValues.push(checkbox.value);
        selectedCategoryList.push(
          <TagContainer key={'checkbox-field-' + checkbox.value + i}>
            <TagLabel>
              <SelectedCheckbox type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
              <span dangerouslySetInnerHTML={{__html: checkbox.label}} />
            </TagLabel>
          </TagContainer>,
        );
        return null;
      } else {
        categoriesList.push(
          <CategoryContainer key={'checkbox-field-' + checkbox.value + i}>
            <CheckboxLabel>
              <UnselectedCheckbox type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
              <span dangerouslySetInnerHTML={{__html: checkbox.label}} />
            </CheckboxLabel>
          </CategoryContainer>,
        );
      }

    });
  }

  const selectedDataKeywordsList: React.ReactNode[] = [];
  const dataKeywordsList: React.ReactNode[] = [];
  const selectedDataKeywordsValues: string[] = [];
  if (dataKeywordsValues && dataKeywordsValues.length) {
    dataKeywordsValues.forEach((checkbox, i) => {

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const newDataKeywordsValues = dataKeywordsValues.map((c, j) => {
          if (i === j) {
            return {...c, checked};
          } else {
            return c;
          }
        });
        setDataKeywordsValues(newDataKeywordsValues);
        setUrl({
          query: search,
          keywords: keywordValues.filter((v) => v.checked).map(({value}) => value),
          categories: categoriesValues.filter((v) => v.checked).map(({value}) => value),
          dataKeywords: newDataKeywordsValues.filter((v) => v.checked).map(({value}) => value),
          status: statusValues.filter((v) => v.checked).map(({value}) => value),
        });
      };


      if (checkbox.checked) {
        selectedDataKeywordsValues.push(checkbox.value);
        selectedDataKeywordsList.push(
          <TagContainer key={'checkbox-field-' + checkbox.value + i}>
            <TagLabel>
              <SelectedCheckbox type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
              <span dangerouslySetInnerHTML={{__html: checkbox.label}} />
            </TagLabel>
          </TagContainer>,
        );
        return null;
      } else {
        dataKeywordsList.push(
          <AttributeContainer key={'checkbox-field-' + checkbox.value + i}>
            <CheckboxLabel>
              <UnselectedCheckbox type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
              <span dangerouslySetInnerHTML={{__html: checkbox.label}} />
            </CheckboxLabel>
          </AttributeContainer>,
        );
      }

    });
  }

  const selectedStatusList: React.ReactNode[] = [];
  const statusList: React.ReactNode[] = [];
  const selectedStatusValues: string[] = [];
  if (statusValues && statusValues.length) {
    statusValues.forEach((checkbox, i) => {

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        const newStatusValues = statusValues.map((c, j) => {
          if (i === j) {
            return {...c, checked};
          } else {
            return c;
          }
        });
        setStatusValues(newStatusValues);
        setUrl({
          query: search,
          keywords: keywordValues.filter((v) => v.checked).map(({value}) => value),
          categories: categoriesValues.filter((v) => v.checked).map(({value}) => value),
          dataKeywords: dataKeywordsValues.filter((v) => v.checked).map(({value}) => value),
          status: newStatusValues.filter((v) => v.checked).map(({value}) => value),
        });
      };


      if (checkbox.checked) {
        selectedStatusValues.push(checkbox.value);
        selectedStatusList.push(
          <TagContainer key={'checkbox-field-' + checkbox.value + i}>
            <TagLabel>
              <SelectedCheckbox type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
              <span>
                {checkbox.label.charAt(0).toUpperCase() + checkbox.label.slice(1).toLowerCase()}
              </span>
            </TagLabel>
          </TagContainer>,
        );
        return null;
      } else {
        statusList.push(
          <StatusContainer key={'checkbox-field-' + checkbox.value + i}>
            <CheckboxLabel>
              <UnselectedCheckbox type={'checkbox'} checked={checkbox.checked} onChange={onChange} value={checkbox.value} />
              <span>{checkbox.label.toLowerCase()}</span>
            </CheckboxLabel>
          </StatusContainer>,
        );
      }

    });
  }

  const filteredProjects = projects.filter(project => {
    const {projectName} = project;
    const projectCategory = project.projectCategory ? project.projectCategory.toLowerCase() : '';
    const projectStatus = project.status ? project.status.toLowerCase() : '';
    const projectData = project.data ? project.data.map(d => d.toLowerCase()) : [];
    const keywords = project.keywords ? project.keywords.map(k => k.toLowerCase()) : [];
    if (
        (!selectedCategoriesValues.length || selectedCategoriesValues.includes(projectCategory)) &&
        (!selectedStatusValues.length || selectedStatusValues.includes(projectStatus)) &&
        (!selectedKeywordValues.length || selectedKeywordValues.some(k => keywords.includes(k.toLowerCase()))) &&
        (!selectedDataKeywordsValues.length || selectedDataKeywordsValues.some(k => projectData.includes(k.toLowerCase()))) &&
        (  projectName.toLowerCase().includes(search.toLowerCase()) ||
          keywords.find(k => k.toLowerCase().includes(search.toLowerCase())) ||
          projectData.find(k => k.toLowerCase().includes(search.toLowerCase())) ||
          projectCategory.includes(search.toLowerCase()) ||
          projectStatus.includes(search.toLowerCase())
        )
       ) {
      return true;
    } else {
      return false;
    }
  });

  return (
    <>
      <Root>
        <BasicSearch
          placeholder={'Type or select keywords...'}
          setSearchQuery={setSearchQuery}
          initialQuery={initialQuery}
          focusOnMount={true}
          searchBarStyleOverrides={{
            backgroundColor: 'transparent',
            textTransform: 'uppercase',
            fontFamily: secondaryFont,
            border: 'none',
            outline: 'none',
            padding: '1rem 0.5rem 1rem 0.5rem',
            boxShadow: 'none',
          }}
          containerStyleOverrides={{
            border: '1px solid #666',
          }}
          additionalContent={(
            <>
              {selectedCategoryList}
              {selectedKeywordList}
              {selectedDataKeywordsList}
              {selectedStatusList}
            </>
          )}
        />
        <KeywordsGrid>
          <CategoriesContainer>
            <CheckboxTitle>Categories</CheckboxTitle>
            <CheckboxGrid>
              {categoriesList}
            </CheckboxGrid>
          </CategoriesContainer>
          <div>
            <CheckboxTitle>Data</CheckboxTitle>
            {dataKeywordsList}
          </div>
          <div>
            <CheckboxTitle>Status</CheckboxTitle>
            {statusList}
          </div>
        </KeywordsGrid>
        <div>
          <CheckboxTitle>Keywords</CheckboxTitle>
          <KeywordsContainer>
            {keywordList}
          </KeywordsContainer>
        </div>
      </Root>
      <SearchResults
        projects={filteredProjects}
        projectsKey={filteredProjects.reduce((key, p) => p.projectName + key, '')}
      />
    </>
  );
};

export default SearchView;