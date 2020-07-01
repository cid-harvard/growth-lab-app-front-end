import React, {useState} from 'react';

export interface Settings {
  allowZoom?: boolean;
  allowPan?: boolean;
  mapCallback?: (map: any) => void;
}

interface Props extends Settings{
  map: any;
}


const MapSettingsComponent = (props: Props) => {
  const {
    map, allowPan, allowZoom, mapCallback,
  } = props;

  const [haveSettingsBeenSet, setSettings] = useState<boolean>(false);

  if (map && haveSettingsBeenSet === false) {
    if (allowZoom === true) {
      map.scrollZoom.enable();
      map.doubleClickZoom.enable();
    }
    if (allowPan === true) {
      map.dragPan.enable();
      map.dragRotate.enable();
    }
    if (allowZoom === false && allowPan === false) {
      map.getCanvas().style.cursor = 'default';
    }
    if (mapCallback !== undefined) {
      mapCallback(map);
    }
    setSettings(true);
  }

  return <React.Fragment />;
};

export default MapSettingsComponent;
