import React, {useState} from 'react';
import Modal from './StandardModal';
import styled, {keyframes} from 'styled-components/macro';
import {
  baseColor,
  secondaryFont,
  primaryFont,
} from '../../styling/styleUtils';
// import useFluent from '../../../../hooks/useFluent';
import raw from 'raw.macro';
import getShareFunctions from './shareFn';

const iconGray = '#2D363F';

const linkSvg = raw('../../assets/link.svg');
const twitterSvg = raw('../../assets/twitter.svg');
const linkedinSvg = raw('../../assets/linkedin.svg');
const facebookSvg = raw('../../assets/facebook.svg');
const emailSvg = raw('../../assets/email.svg');

const growIn = keyframes`
  0% {
    transform: scale(0.4);
  }

  100% {
    transform: scale(1);
  }
`;

const Root = styled.div`
  background-color: #fff;
  position: relative;
  animation: ${growIn} 0.1s normal forwards ease-in-out;
  animation-iteration-count: 1;
  color: ${baseColor};
  height: 100%;
  padding: 2rem;

  @media screen and (max-height: 800px) {
    overflow: visible;
  }
`;

const CloseButton = styled.button`
  background-color: transparent;
  border-none;
  padding: 0.5rem;
  text-transform: uppercase;
  font-size: 1.25rem;
  font-family: ${secondaryFont};
  position: absolute;
  right: 0;
  top: 0;
`;

const SectionTitle = styled.div`
  font-size: 1.25rem;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  font-family: ${primaryFont};
`;

const SvgBase = styled.div`
  svg {
    width: 100%;
    height: 100%;

    path {
      fill: ${iconGray};
    }
  }
`;

const CopyUrlBar = styled.div`
  min-height: 1rem;
  max-width: 450px;
  white-space: nowrap;
  display: grid;
  grid-template-columns: 1.45rem 1fr auto;
  background-color: lightgray;
  margin-bottom: 2rem;
  cursor: pointer;
`;

const CopyIcon = styled(SvgBase)`
  padding-left: 0.45rem;
`;

const UrlText = styled.div`
  overflow: hidden;
  padding: 0.45rem 0.55rem;
`;

const CopyButton = styled.button`
  font-family: ${primaryFont};
  text-transform: uppercase;
  padding: 0.45rem 0.75rem;
  background-color: ${iconGray};
  color: #fff;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
`;

const SocialMediaContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

const SocialMediaButton = styled.button`
  width: 2.875rem;
  height: 2.875rem;
  display: flex;
  align-items: center;
  margin-right: 1.5rem;
  background-color: transparent;
`;

interface Props {
  onClose: () => void;
  useTitle: string;
}

export default (props: Props) => {
  const {
    onClose,
    useTitle
  } = props;
  // const getString = useFluent();
  const [copied, setCopied] = useState<boolean>(false);
  const onCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };
  const copyText = copied ? 'Copied' : 'Copy';

  const {shareFacebook, shareTwitter, shareLinkedIn, shareEmail} = getShareFunctions(window.location.href);

  let titleForSocial = 'Check out the Growth Lab Viz Hub';
  if(useTitle) {
    titleForSocial = `Check out '${useTitle},' in Visual Insights from the Growth Lab's 2022 Research`;
  }
  return (
    <Modal
      onClose={onClose}
      height='auto'
      width='500px'
    >
      <Root>
        <SectionTitle>
          Direct Link
        </SectionTitle>
        <CopyUrlBar onClick={onCopy}>
          <CopyIcon
            dangerouslySetInnerHTML={{__html: linkSvg}}
          />
          <UrlText>
            {window.location.href}
          </UrlText>
          <CopyButton>
            {copyText}
          </CopyButton>
        </CopyUrlBar>
        <SectionTitle>
          Social Media Sharing
        </SectionTitle>
        <SocialMediaContainer>
          <SocialMediaButton
            onClick={() => shareTwitter(titleForSocial)}
          >
            <SvgBase
              dangerouslySetInnerHTML={{__html: twitterSvg}}
            />
          </SocialMediaButton>
          <SocialMediaButton
            onClick={() => shareLinkedIn(titleForSocial, '')}
          >
            <SvgBase
              dangerouslySetInnerHTML={{__html: linkedinSvg}}
            />
          </SocialMediaButton>
          <SocialMediaButton
            onClick={() => shareFacebook()}
          >
            <SvgBase
              dangerouslySetInnerHTML={{__html: facebookSvg}}
            />
          </SocialMediaButton>
          <SocialMediaButton
            style={{width: '3.25rem'}}
            onClick={() => shareEmail(
                titleForSocial, titleForSocial, window.location.href,
            )}
          >
            <SvgBase
              dangerouslySetInnerHTML={{__html: emailSvg}}
            />
          </SocialMediaButton>
        </SocialMediaContainer>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </Root>
    </Modal>
  );
};
