import { Tooltip, useTooltip } from "@visx/tooltip";
import ScrollyCanvas from "./ScrollyCanvas";
import ScrollyText from "./ScrollyText";
import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { GET_COUNTRIES } from "../../queries/countries";

const Scrolly = ({
  step,
  prevStep,
  scrollDirection,
  onStepChange,
  onScroll,
  countrySelection,
  yearSelection,
}) => {
  const { data, loading, error } = useQuery(GET_COUNTRIES);
  
  const countries = data?.ggLocationCountryList || [];
  const countryLookup = useMemo(() => {
    return countries.reduce((acc, country) => {
      acc[country.iso3Code] = country.name;
      return acc;
    }, {});
  }, [countries]);

  const countryName = useMemo(
    () => countryLookup[countrySelection] || '',
    [countryLookup, countrySelection],
  );

  const views = useMemo(
    () => ({
      0: {
        title: "Green Supply Chains and their Components",
        base: "bubbles",
        tooltip: ["title"],
        modalContent:
          "Green supply chains include a range of products from critical minerals to final goods. These products require distinct capabilities and complexity. Each circle represents an important input for a green supply chain that is critical for the energy transition.",
      },
      1: {
        title: "Green Supply Chains and their Components",
        base: "bubbles",
        tooltip: ["title"],
      },
      2: {
        title: "Comparative Advantage in Green Supply Chains",
        base: "bubbles",
        tooltip: ["title", "rca"],
        fill: "rca",
        modalContent: `${countryName} has greater competitiveness in some parts of green supply chains than others. ${countryName} is most competitive in components that are fully shaded, moderately competitive for components that are moderately shaded, and least competitive in components that are lightly shaded.`,
      },
      3: {
        title: "Comparative Advantage in Green Supply Chains",
        base: "bubbles",
        tooltip: ["title", "rca"],
        fill: "rca",
      },
      4: {
        title: "Critical Mineral Opportunities Across Supply Chains",
        base: "bubbles",
        tooltip: ["title", "rca"],
        fill: "rca",
        stroke: "minerals",
        modalContent:
          "Critical minerals are an essential driver of the energy transition. They form important inputs across many different energy technologies and supply chains. For the world to succeed in addressing climate change, mineral producers and refiners will need to scale-up production–and quickly, which represents an important green growth opportunity for many countries. This requires not just mineral deposits, but also good mining policy. In this graph, critical minerals appear as circles with a black border across all the energy supply chains. ",
      },
      5: {
        title: "Critical Mineral Opportunities Across Supply Chains",

        base: "bubbles",
        tooltip: ["title", "rca"],
        fill: "rca",
        stroke: "minerals",
      },
      6: {
        title: "Comparative Advantage Across Different Green Supply Chains",
        base: "bars",
        tooltip: ["title", "value"],
        modalContent: `The figure analyzes ${countryName}’s presence in each supply chain (colored bar) versus the production ${countryName} would have if it had average competitiveness in all components of the supply chain (black line). The figure helps to assess the competitiveness of the country in each supply chain and the concentration of that competitiveness in one or several components. `,
      },
      7: {
        title: "Comparative Advantage Across Different Green Supply Chains",
        base: "bars",
        tooltip: ["title", "value"],
      },
    }),
    [countryName]
  );
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  const handleModalClose = () => {
    onStepChange(step + 1);
  };
  const view = useMemo(() => views[step], [views, step]);
  const prevBase = useMemo(() => views[prevStep].base, [views, prevStep]);
  const totalSteps = useMemo(() => Object.keys(views).length, [views]);
  return (
    <div style={{ height: "100vh" }}>
      <ScrollyCanvas
        view={view}
        totalSteps={totalSteps}
        prevBase={prevBase}
        showTooltip={showTooltip}
        hideTooltip={hideTooltip}
        onScroll={onScroll}
        countrySelection={countrySelection}
        yearSelection={yearSelection}
      />
      {tooltipOpen && (
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          {views[step].tooltip.map((key) => (
            <div key={key}>
              <strong>{key}:</strong> {tooltipData[key]}
            </div>
          ))}
        </Tooltip>
      )}

      <ScrollyText
        open={views[step].modalContent}
        onClose={handleModalClose}
        direction={scrollDirection}
        onScroll={onScroll}
      >
        <p>{views[step].modalContent}</p>
      </ScrollyText>
    </div>
  );
};

export default Scrolly;
