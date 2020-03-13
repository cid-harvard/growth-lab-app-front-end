import React, {useState} from 'react';
import Radar from 'react-d3-radar';
import styled from 'styled-components';


const Tooltip = styled.div`
  position: fixed;
  text-align: left;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  color: #333;
  pointer-events: none;
  box-shadow: 0px 0px 3px -1px #b5b5b5;
  border: solid 1px gray;
  max-width: 300px;
`;



interface HoverPoint {
  x: number;
  y: number;
  value: number;
  setKey: string;
  variableKey: string;
  key: string;
}

const SpyderChart = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [tooltipLocation, setTooltipLocation] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [tooltipContent, setTooltipContent] = useState<HoverPoint | null>(null);

    console.log(tooltipLocation)
  const tooltip = isTooltipVisible === false || tooltipContent === null ? null : (
    <Tooltip
      style={{
        top: tooltipLocation.y,
        left: tooltipLocation.x,
      }}
    >
      {tooltipContent.variableKey}: {tooltipContent.value}
    </Tooltip>
  );

  const onMouseMove = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    setTooltipLocation({x, y})
    setIsTooltipVisible(true);
  }

  return (
    <div
      onMouseMove={onMouseMove}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      <Radar
        width={500}
        height={500}
        padding={70}
        domainMax={10}
        highlighted={null}
        onHover={(point: HoverPoint | null) => {
          if (point) {
            setTooltipContent(point)}
          }
        }
        data={{
          variables: [
            {key: 'resilience', label: 'Resilience'},
            {key: 'strength', label: 'Strength'},
            {key: 'adaptability', label: 'Adaptability'},
            {key: 'creativity', label: 'Creativity'},
            {key: 'openness', label: 'Open to Change'},
          ],
          sets: [
            {
              key: 'me',
              label: 'My Scores',
              values: {
                resilience: 4,
                strength: 6,
                adaptability: 7,
                creativity: 2,
                openness: 8,
                confidence: 1,
              },
            },
          ],
        }}
      />
      {tooltip}
    </div>
  );
}

export default SpyderChart;