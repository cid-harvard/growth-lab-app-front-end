import React from 'react';
import styled from 'styled-components/macro';
import {
  SectionHeaderSecondary,
  lightBorderColor,
  secondaryFont,
} from '../../styling/styleUtils';
import {lighten} from 'polished';

const Root = styled.div`
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAI0lEQVQYV2NkwAEYYeLeeU3GIPbWSXVnQTRhCXQT4TqIlgAACbAIB9ZyaUoAAAAASUVORK5CYII=) repeat;
  padding: 1rem;

  @media(max-width: 900px) {
    padding: 1rem 0.75rem;
  }
`;

const Content = styled.div`
  padding: 1rem 2rem;

  @media(max-width:900px) {
    padding: 1rem 0;
  }
`;

const SectionHeader = styled(SectionHeaderSecondary)`
  text-transform: none;
  font-weight: 400;
  margin: 0 0 1rem;
`;

const PasswordContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const Password = styled.input`
  font-size: 1rem;
  padding: 0.65rem 0.5rem;
  border: 1px solid ${lightBorderColor};
  width: 300px;
  max-width: 300px;
  flex-grow: 0;
  font-family: ${secondaryFont};

  &::placeholder {
    font-family: ${secondaryFont};
  }

  @media (max-width: 600px) {
    width: auto;
  }
`;

interface ButtonProps {
  primaryColor: string;
}

const SubmitButton = styled.button<ButtonProps>`
  text-align: center;
  font-size: 1rem;
  text-transform: uppercase;
  height: 100%;
  color: #fff;
  padding: 0.7rem 1.2rem;
  font-family: ${secondaryFont};
  background-color: ${({primaryColor}) => primaryColor};

  &:hover {
    background-color: ${({primaryColor}) => lighten(0.1 ,primaryColor)};
  }
`;

interface Props {
  title: string;
  buttonColor: string;
  children: React.ReactNode;
}

const PasswordProtectedComponent = (props: Props) => {
  const {
    title, children, buttonColor,
  } = props;

  return (
    <Root>
      <SectionHeader>{title}</SectionHeader>
      <Content>
        <PasswordContainer>
          <Password type='password' placeholder='Type Your Password' />
          <SubmitButton primaryColor={buttonColor}>Submit</SubmitButton>
        </PasswordContainer>
        {children}
      </Content>
    </Root>
  );
};

export default PasswordProtectedComponent;