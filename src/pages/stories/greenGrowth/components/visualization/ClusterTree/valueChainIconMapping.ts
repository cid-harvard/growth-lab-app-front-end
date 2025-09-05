// Import icon files
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
