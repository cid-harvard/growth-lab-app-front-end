// Import icon files as URLs (default) and as inline SVG React components
import type React from "react";
import ElectricVehiclesIcon from "../../../../../../assets/greenGrowth/Electric_vehicles.svg";
import HeatPumpsIcon from "../../../../../../assets/greenGrowth/Heat_pumps.svg";
import GreenHydrogenIcon from "../../../../../../assets/greenGrowth/Green Hydrogen.svg";
import WindPowerIcon from "../../../../../../assets/greenGrowth/Wind_power.svg";
import SolarPowerIcon from "../../../../../../assets/greenGrowth/Solar_power.svg";
import HydroelectricPowerIcon from "../../../../../../assets/greenGrowth/Hydroelectric_Power.svg";
import NuclearPowerIcon from "../../../../../../assets/greenGrowth/Nuclear_power.svg";
import BatteriesIcon from "../../../../../../assets/greenGrowth/Batteries.svg";
import ElectricGridIcon from "../../../../../../assets/greenGrowth/Electric Grid.svg";
import CriticalMetalsIcon from "../../../../../../assets/greenGrowth/Critical Metals.svg";

// Inline SVG React components (for reliable html2canvas capture)
import { ReactComponent as ElectricVehiclesIconSvg } from "../../../../../../assets/greenGrowth/Electric_vehicles.svg";
import { ReactComponent as HeatPumpsIconSvg } from "../../../../../../assets/greenGrowth/Heat_pumps.svg";
import { ReactComponent as GreenHydrogenIconSvg } from "../../../../../../assets/greenGrowth/Green Hydrogen.svg";
import { ReactComponent as WindPowerIconSvg } from "../../../../../../assets/greenGrowth/Wind_power.svg";
import { ReactComponent as SolarPowerIconSvg } from "../../../../../../assets/greenGrowth/Solar_power.svg";
import { ReactComponent as HydroelectricPowerIconSvg } from "../../../../../../assets/greenGrowth/Hydroelectric_Power.svg";
import { ReactComponent as NuclearPowerIconSvg } from "../../../../../../assets/greenGrowth/Nuclear_power.svg";
import { ReactComponent as BatteriesIconSvg } from "../../../../../../assets/greenGrowth/Batteries.svg";
import { ReactComponent as ElectricGridIconSvg } from "../../../../../../assets/greenGrowth/Electric Grid.svg";
import { ReactComponent as CriticalMetalsIconSvg } from "../../../../../../assets/greenGrowth/Critical Metals.svg";

// Map value chain names to their corresponding icon file paths
export const valueChainIconMapping: Record<string, string> = {
  "Electric Vehicles": ElectricVehiclesIcon,
  "Heat Pumps": HeatPumpsIcon,
  "Fuel Cells And Green Hydrogen": GreenHydrogenIcon,
  "Wind Power": WindPowerIcon,
  "Solar Power": SolarPowerIcon,
  "Hydroelectric Power": HydroelectricPowerIcon,
  "Nuclear Power": NuclearPowerIcon,
  Batteries: BatteriesIcon,
  "Electric Grid": ElectricGridIcon,
  "Critical Metals and Minerals": CriticalMetalsIcon,
};

// Get icon path for a value chain name, with fallback
export const getValueChainIcon = (valueChainName: string): string | null => {
  return valueChainIconMapping[valueChainName] || null;
};

// Component mapping for inline SVGs
export type ValueChainIconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export const valueChainIconComponentMapping: Record<
  string,
  ValueChainIconComponent
> = {
  "Electric Vehicles": ElectricVehiclesIconSvg,
  "Heat Pumps": HeatPumpsIconSvg,
  "Fuel Cells And Green Hydrogen": GreenHydrogenIconSvg,
  "Wind Power": WindPowerIconSvg,
  "Solar Power": SolarPowerIconSvg,
  "Hydroelectric Power": HydroelectricPowerIconSvg,
  "Nuclear Power": NuclearPowerIconSvg,
  Batteries: BatteriesIconSvg,
  "Electric Grid": ElectricGridIconSvg,
  "Critical Metals and Minerals": CriticalMetalsIconSvg,
};

export const getValueChainIconComponent = (
  valueChainName: string,
): ValueChainIconComponent | null => {
  return valueChainIconComponentMapping[valueChainName] || null;
};
