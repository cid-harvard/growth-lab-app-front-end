import React, {useState, useEffect, createContext} from 'react';
import Tooltip, {TooltipPosition} from './Tooltip';
import raw from 'raw.macro';
import {
  UtilityBarButtonBase,
  columnsToRowsBreakpoint,
  mediumSmallBreakpoint,
  Text,
  TooltipContent,
  SvgBase,
} from './Utils';
import ShareModal from './ShareModal';
import debounce from 'lodash/debounce';
// import { useTimeout } from 'react-use';


const shareIconSvg = raw('../../assets/share.svg');

interface IAppContext {
    windowDimensions: {width: number, height: number};
}

const initialWindowDimension = {width: window.innerWidth, height: window.innerHeight};
createContext<IAppContext>({
    windowDimensions: initialWindowDimension,
});

const useWindowWidth = () => {
    const [windowDimensions, setWindowDimensions] = useState<IAppContext['windowDimensions']>(initialWindowDimension);
  
    useEffect(() => {
      const updateWindowDimensions = debounce(() => {
        setWindowDimensions({width: window.innerWidth, height: window.innerHeight});
      }, 500);
      window.addEventListener('resize', updateWindowDimensions);
      return () => {
        window.removeEventListener('resize', updateWindowDimensions);
      };
    }, []);
  
    return windowDimensions;
  };

interface Props {
    useTitle: string;
}

const Share = (props: Props) => {
  const windowDimensions = useWindowWidth();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const {useTitle} = props;

  const modal = modalOpen ? (
    <ShareModal onClose={closeModal} useTitle={useTitle}/>
  ) : null;
  return (
    <>
      <Tooltip
        explanation={windowDimensions.width < mediumSmallBreakpoint &&
          windowDimensions.width > columnsToRowsBreakpoint
          ? <TooltipContent>SHARE</TooltipContent>
          : null
        }
        cursor='pointer'
        tooltipPosition={TooltipPosition.Bottom}
      >
        <UtilityBarButtonBase onClick={openModal}>
          <SvgBase
            dangerouslySetInnerHTML={{__html: shareIconSvg}}
          />
          <Text>
            SHARE
          </Text>
        </UtilityBarButtonBase>
      </Tooltip>
      {modal}
    </>
  );
};

export default Share;
