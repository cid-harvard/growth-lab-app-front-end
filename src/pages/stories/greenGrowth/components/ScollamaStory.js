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

export const yearSelectionState = atom({
  key: "yearSelectionState",
  default: "2022",
});

export const countrySelectionState = atom({
  key: "countrySelectionState",
  default: "31",
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
      },

      {
        title: "Comparative Advantage Across Green Value Chains",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Relative Comparative Advantage" }],
        fill: "rca",
        modalContent: `${countryName} has varying levels of competitiveness across different parts of green value chains. ${countryName} is strongest in components that are fully shaded, fairly competitive in those with moderate shading, and least competitive in components with light shading.`,
        legend: "rca",
      },

      {
        title: "Critical Mineral Opportunities Across Value Chains",
        base: "bubbles",
        tooltip: [{ field: "rca", title: "Relative Comparative Advantage" }],
        fill: "rca",
        stroke: "minerals",
        modalContent:
          "Critical minerals power the energy transition, since they form important inputs to many different energy technologies. For the world to address climate change, mineral producers will need to quickly scale-up production, which represents an important green growth opportunity for many countries. This requires mineral deposits and good mining policy. In this graph, critical minerals appear as circles with a black border.",
        legend: "minerals",
      },

      {
        title: "Competitiveness in Green Value Chains",
        base: "bars",
        tooltip: [{ field: "value", title: "Export Value" }],
        modalContent: `This figure analyzes ${countryName}'s presence in each value chain (colored bar) versus the production ${countryName} would have if it had average competitiveness in all components of the value chain (black line). The figure helps to assess ${countryName}'s competitiveness in each value chain and the concentration of that competitiveness in one or several components.`,
        legend: "production",
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
        <StandardFooter />
      </div>
    </div>
  );
};

export default ScollamaStory;
