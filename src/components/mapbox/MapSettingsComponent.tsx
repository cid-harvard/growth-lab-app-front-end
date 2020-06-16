import React, {useState} from 'react';

export interface Settings {
  allowZoom?: boolean;
  allowPan?: boolean;
}

interface Props extends Settings{
  map: any;
}


const MapSettingsComponent = (props: Props) => {
  const {
    map, allowPan, allowZoom,
  } = props;

  const [haveSettingsBeenSet, setSettings] = useState<boolean>(false);

  if (map && haveSettingsBeenSet === false) {
    if (allowZoom === true) {
      map.scrollZoom.enable();
      map.doubleClickZoom.enable();
    }
    if (allowPan === true) {
      map.dragPan.enable();
    }
    setSettings(true);
  }

  return <React.Fragment />;
};

export default MapSettingsComponent;
