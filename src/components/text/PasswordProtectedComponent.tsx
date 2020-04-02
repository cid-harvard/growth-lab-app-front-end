import React from 'react';
import styled from 'styled-components/macro';
import {
  lightBorderColor,
  secondaryFont,
} from '../../styling/styleUtils';
import {lighten} from 'polished';

const Root = styled.div`
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAI0lEQVQYV2NkwAEYYeLeeU3GIPbWSXVnQTRhCXQT4TqIlgAACbAIB9ZyaUoAAAAASUVORK5CYII=) repeat;
  padding: 1rem 2.5rem;
  box-sizing: border-box;

  @media(max-width: 900px) {
    padding: 1rem;
  }
`;

const Label = styled.p`
  margin: 0 0 1rem;
`;
const LabelBackground = styled.span`
  background-color: #fff;
`;

const PasswordContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const Password = styled.input`
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
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
  font-size: 0.875rem;
  text-transform: uppercase;
  height: 100%;
  color: #fff;
  padding: 0.45rem 0.75rem;
  font-family: ${secondaryFont};
  background-color: ${({primaryColor}) => primaryColor};
  border: solid 1px ${({primaryColor}) => primaryColor};

  &:hover {
    background-color: ${({primaryColor}) => lighten(0.1 ,primaryColor)};
    border-color: ${({primaryColor}) => lighten(0.1 ,primaryColor)};
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
      <Label>
        <LabelBackground>
          {title}
        </LabelBackground>
      </Label>
      <PasswordContainer>
        <Password type='password' placeholder='Type Your Password' />
        <SubmitButton primaryColor={buttonColor}>Submit</SubmitButton>
      </PasswordContainer>
      {children}
    </Root>
  );
};

export default PasswordProtectedComponent;