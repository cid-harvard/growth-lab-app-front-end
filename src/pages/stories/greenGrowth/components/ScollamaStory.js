import React, { useState, useCallback, useMemo, useRef } from "react";
import { Scrollama, Step } from "react-scrollama";
import "./scollStyles.css";
import Landing from "./Landing";
import Scrolly from "./visualization/Scrolly";
import ProductScatter from "./visualization/ProductScatter";
import { useCountryName } from "../queries/useCountryName";
import HeaderControls from "./HeaderControls";
import ProductRadar from "./visualization/ProductRadar";
import StandardFooter from "../../../../components/text/StandardFooter";
import TakeoffPage from "./TakeoffPage";
import { atom } from "recoil";
import Attribution from "./Attribution";

export const yearSelectionState = atom({
  key: "yearSelectionState",
  default: "2022",
});

export const countrySelectionState = atom({
  key: "countrySelectionState",
  default: 710,
});

const ScollamaStory = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [prevStepIndex, setPrevStepIndex] = useState(0);
  const countryName = useCountryName();
  const steps = useMemo(
    () => [
      {
        title: "Green Value Chains and Their Components",
        base: "bubbles",
        tooltip: [],
        modalContent:
          "Green value chains include a range of products from critical minerals to final goods. These products require distinct productive capabilities. Each circle represents an input for a green value chain that is critical for the energy transition.",
        legendHeight: 50,
      },

      {
        title: "Comparative Advantage Across Green Value Chains",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Revealed Comparative Advantage" }],
        fill: "rca",
        modalContent: `Here is ${countryName}'s competitiveness across different green value chains.`,
        legend: "rca",
        legendHeight: 50,
      },

      {
        title: "Critical Mineral Opportunities Across Value Chains",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Revealed Comparative Advantage" }],
        fill: "rca",
        stroke: "minerals",
        modalContent:
          "Critical minerals power the energy transition, since they form important inputs to many different energy technologies. Minerals are circled here with black borders. For the world to decarbonize, mineral producers will need to quickly scale-up production, which represents an important green growth opportunity for many countries. This requires mineral deposits and good mining policy.",
        legend: "minerals",
        legendHeight: 50,
      },
      {
        title: "Competitiveness in Green Value Chains",
        base: "bars",
        tooltip: [{ field: "value", title: "Export Value" }],
        modalContent: `This shows ${countryName}'s actual presence (colored bar) in each green value chain versus the level if ${countryName} had average competitiveness in all value chain components (black line), revealing ${countryName}'s areas of strength and concentration.`,
        legend: "production",
        legendHeight: 50,
      },
    ],
    [countryName],
  );

  const onStepEnter = ({ data }) => {
    setPrevStepIndex(currentStepIndex);
    setCurrentStepIndex(data);
  };

  const handleStepChange = useCallback((newStep) => {
    setCurrentStepIndex(newStep);
  }, []);

  const scrollAppRef = useRef(null);
  const handleExplore = () => {
    scrollAppRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="scollama-story appRoot">
      <Landing onExplore={handleExplore} />
      <div style={{ position: "relative" }}>
        <HeaderControls />
        <div
          className="scroll-controlled-container"
          style={{ height: `${steps.length * 200}vh` }}
          ref={scrollAppRef}
        >
          <div className="sticky-visualization">
            <Scrolly
              steps={steps}
              currentStep={currentStepIndex}
              prevStep={prevStepIndex}
              onStepChange={handleStepChange}
            />
          </div>

          <Scrollama onStepEnter={onStepEnter} offset={1}>
            {steps.map((step, index) => (
              <Step data={index} key={index}>
                <div className="step-content">
                  <div className="step-content-inner">
                    <p>{step.modalContent}</p>
                  </div>
                </div>
              </Step>
            ))}
          </Scrollama>
        </div>

        <div>
          <ProductScatter />
        </div>
        <div style={{ minHeight: "100vh" }}>
          <ProductRadar />
        </div>
        <TakeoffPage />
        <Attribution />
        <StandardFooter />
      </div>
    </div>
  );
};

export default ScollamaStory;
