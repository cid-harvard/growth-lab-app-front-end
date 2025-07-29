import React, { useState, useMemo, useRef, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  SelectChangeEvent,
  Box,
  Slider,
} from "@mui/material";
import { useQuery, gql } from "@apollo/client";
import styled from "styled-components";
import {
  FullWidthContent,
  FullWidthContentContainer,
} from "../../../../styling/Grid";
import { pack, hierarchy } from "d3-hierarchy";
import { scaleSqrt, scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import DefaultMap from "../../../../components/mapbox";

// Import existing GraphQL queries
import {
  GET_PRODUCTS,
  GET_COUNTRIES,
  GET_SUPPLY_CHAINS,
  GET_CLUSTERS,
  GET_COUNTRY_PRODUCT_DATA,
} from "../queries/shared";

// Define the supply chain mappings query locally since it's not exported
const GET_ALL_SUPPLY_CHAIN_MAPPINGS = gql`
  query GetAllSupplyChainMappings {
    supplyChain0: ggSupplyChainClusterProductMemberList(supplyChainId: 0) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain1: ggSupplyChainClusterProductMemberList(supplyChainId: 1) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain2: ggSupplyChainClusterProductMemberList(supplyChainId: 2) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain3: ggSupplyChainClusterProductMemberList(supplyChainId: 3) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain4: ggSupplyChainClusterProductMemberList(supplyChainId: 4) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain5: ggSupplyChainClusterProductMemberList(supplyChainId: 5) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain6: ggSupplyChainClusterProductMemberList(supplyChainId: 6) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain7: ggSupplyChainClusterProductMemberList(supplyChainId: 7) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain8: ggSupplyChainClusterProductMemberList(supplyChainId: 8) {
      supplyChainId
      productId
      clusterId
    }
    supplyChain9: ggSupplyChainClusterProductMemberList(supplyChainId: 9) {
      supplyChainId
      productId
      clusterId
    }
  }
`;

const theme = createTheme({
  typography: {
    fontFamily: '"Source Sans Pro", "Source Sans", sans-serif',
  },
});

const PageContainer = styled(FullWidthContentContainer)`
  padding: 40px 20px;
  font-family: "Source Sans Pro", sans-serif;
  width: 100vw;
  max-width: none;
  margin: 0;
`;

const ControlsContainer = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MapContainer = styled.div`
  width: 100%;
  height: 80vh;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CirclePackOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`;

const StatsContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
`;

const StatsText = styled.p`
  margin: 4px 0;
  color: #2c3e50;
  font-size: 0.9rem;
`;

// Country coordinates mapping (centroid lat/lng for each country)
const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "4": { lat: 33.93911, lng: 67.709953 }, // Afghanistan
  "24": { lat: -11.202692, lng: 17.873887 }, // Angola
  "8": { lat: 41.153332, lng: 20.168331 }, // Albania
  "784": { lat: 23.424076, lng: 53.847818 }, // United Arab Emirates
  "32": { lat: -38.416097, lng: -63.616672 }, // Argentina
  "51": { lat: 40.069099, lng: 45.038189 }, // Armenia
  "36": { lat: -25.274398, lng: 133.775136 }, // Australia
  "40": { lat: 47.516231, lng: 14.550072 }, // Austria
  "31": { lat: 40.143105, lng: 47.576927 }, // Azerbaijan
  "56": { lat: 50.503887, lng: 4.469936 }, // Belgium
  "204": { lat: 9.30769, lng: 2.315834 }, // Benin
  "854": { lat: 12.238333, lng: -1.561593 }, // Burkina Faso
  "50": { lat: 23.684994, lng: 90.356331 }, // Bangladesh
  "100": { lat: 42.733883, lng: 25.48583 }, // Bulgaria
  "48": { lat: 25.930414, lng: 50.637772 }, // Bahrain
  "70": { lat: 43.915886, lng: 17.679076 }, // Bosnia and Herzegovina
  "112": { lat: 53.709807, lng: 27.953389 }, // Belarus
  "68": { lat: -16.290154, lng: -63.588653 }, // Bolivia
  "76": { lat: -14.235004, lng: -51.92528 }, // Brazil
  "72": { lat: -22.328474, lng: 24.684866 }, // Botswana
  "124": { lat: 56.130366, lng: -106.346771 }, // Canada
  "756": { lat: 46.818188, lng: 8.227512 }, // Switzerland
  "152": { lat: -35.675147, lng: -71.542969 }, // Chile
  "156": { lat: 35.86166, lng: 104.195397 }, // China
  "384": { lat: 7.539989, lng: -5.54708 }, // Côte d'Ivoire
  "120": { lat: 7.369722, lng: 12.354722 }, // Cameroon
  "180": { lat: -4.038333, lng: 21.758664 }, // Democratic Republic of the Congo
  "178": { lat: -0.228021, lng: 15.827659 }, // Republic of the Congo
  "170": { lat: 4.570868, lng: -74.297333 }, // Colombia
  "188": { lat: 9.748917, lng: -83.753428 }, // Costa Rica
  "192": { lat: 21.521757, lng: -77.781167 }, // Cuba
  "196": { lat: 35.126413, lng: 33.429859 }, // Cyprus
  "203": { lat: 49.817492, lng: 15.472962 }, // Czech Republic
  "276": { lat: 51.165691, lng: 10.451526 }, // Germany
  "208": { lat: 56.26392, lng: 9.501785 }, // Denmark
  "214": { lat: 18.735693, lng: -70.162651 }, // Dominican Republic
  "12": { lat: 28.033886, lng: 1.659626 }, // Algeria
  "218": { lat: -1.831239, lng: -78.183406 }, // Ecuador
  "818": { lat: 26.820553, lng: 30.802498 }, // Egypt
  "724": { lat: 40.463667, lng: -3.74922 }, // Spain
  "233": { lat: 58.595272, lng: 25.013607 }, // Estonia
  "231": { lat: 9.145, lng: 40.489673 }, // Ethiopia
  "246": { lat: 61.92411, lng: 25.748151 }, // Finland
  "250": { lat: 46.227638, lng: 2.213749 }, // France
  "266": { lat: -0.803689, lng: 11.609444 }, // Gabon
  "826": { lat: 55.378051, lng: -3.435973 }, // United Kingdom
  "268": { lat: 42.315407, lng: 43.356892 }, // Georgia
  "288": { lat: 7.946527, lng: -1.023194 }, // Ghana
  "324": { lat: 9.945587, lng: -9.696645 }, // Guinea
  "226": { lat: 1.650801, lng: 10.267895 }, // Equatorial Guinea
  "300": { lat: 39.074208, lng: 21.824312 }, // Greece
  "320": { lat: 15.783471, lng: -90.230759 }, // Guatemala
  "344": { lat: 22.396428, lng: 114.109497 }, // Hong Kong
  "340": { lat: 15.199999, lng: -86.241905 }, // Honduras
  "191": { lat: 45.1, lng: 15.2 }, // Croatia
  "332": { lat: 18.971187, lng: -72.285215 }, // Haiti
  "348": { lat: 47.162494, lng: 19.503304 }, // Hungary
  "360": { lat: -0.789275, lng: 113.921327 }, // Indonesia
  "356": { lat: 20.593684, lng: 78.96288 }, // India
  "372": { lat: 53.41291, lng: -8.24389 }, // Ireland
  "364": { lat: 32.427908, lng: 53.688046 }, // Iran
  "368": { lat: 33.223191, lng: 43.679291 }, // Iraq
  "376": { lat: 31.046051, lng: 34.851612 }, // Israel
  "380": { lat: 41.87194, lng: 12.56738 }, // Italy
  "388": { lat: 18.109581, lng: -77.297508 }, // Jamaica
  "400": { lat: 30.585164, lng: 36.238414 }, // Jordan
  "392": { lat: 36.204824, lng: 138.252924 }, // Japan
  "398": { lat: 48.019573, lng: 66.923684 }, // Kazakhstan
  "404": { lat: -0.023559, lng: 37.906193 }, // Kenya
  "417": { lat: 41.20438, lng: 74.766098 }, // Kyrgyzstan
  "116": { lat: 12.565679, lng: 104.990963 }, // Cambodia
  "410": { lat: 35.907757, lng: 127.766922 }, // South Korea
  "414": { lat: 29.31166, lng: 47.481766 }, // Kuwait
  "418": { lat: 19.85627, lng: 102.495496 }, // Laos
  "422": { lat: 33.854721, lng: 35.862285 }, // Lebanon
  "430": { lat: 6.428055, lng: -9.429499 }, // Liberia
  "434": { lat: 26.3351, lng: 17.228331 }, // Libya
  "144": { lat: 7.873054, lng: 80.771797 }, // Sri Lanka
  "440": { lat: 55.169438, lng: 23.881275 }, // Lithuania
  "428": { lat: 56.879635, lng: 24.603189 }, // Latvia
  "504": { lat: 31.791702, lng: -7.09262 }, // Morocco
  "498": { lat: 47.411631, lng: 28.369885 }, // Moldova
  "450": { lat: -18.766947, lng: 46.869107 }, // Madagascar
  "484": { lat: 23.634501, lng: -102.552784 }, // Mexico
  "807": { lat: 41.608635, lng: 21.745275 }, // North Macedonia
  "466": { lat: 17.570692, lng: -3.996166 }, // Mali
  "104": { lat: 21.913965, lng: 95.956223 }, // Myanmar
  "496": { lat: 46.862496, lng: 103.846656 }, // Mongolia
  "508": { lat: -18.665695, lng: 35.529562 }, // Mozambique
  "478": { lat: 21.00789, lng: -10.940835 }, // Mauritania
  "480": { lat: -20.348404, lng: 57.552152 }, // Mauritius
  "454": { lat: -13.254308, lng: 34.301525 }, // Malawi
  "458": { lat: 4.210484, lng: 101.975766 }, // Malaysia
  "516": { lat: -22.95764, lng: 18.49041 }, // Namibia
  "562": { lat: 17.607789, lng: 8.081666 }, // Niger
  "566": { lat: 9.081999, lng: 8.675277 }, // Nigeria
  "558": { lat: 12.865416, lng: -85.207229 }, // Nicaragua
  "528": { lat: 52.132633, lng: 5.291266 }, // Netherlands
  "578": { lat: 60.472024, lng: 8.468946 }, // Norway
  "524": { lat: 28.394857, lng: 84.124008 }, // Nepal
  "554": { lat: -40.900557, lng: 174.885971 }, // New Zealand
  "512": { lat: 21.4735, lng: 55.975413 }, // Oman
  "586": { lat: 30.375321, lng: 69.345116 }, // Pakistan
  "591": { lat: 8.537981, lng: -80.782127 }, // Panama
  "604": { lat: -9.189967, lng: -75.015152 }, // Peru
  "608": { lat: 12.879721, lng: 121.774017 }, // Philippines
  "598": { lat: -6.314993, lng: 143.95555 }, // Papua New Guinea
  "616": { lat: 51.919438, lng: 19.145136 }, // Poland
  "620": { lat: 39.399872, lng: -8.224454 }, // Portugal
  "600": { lat: -23.442503, lng: -58.443832 }, // Paraguay
  "634": { lat: 25.354826, lng: 51.183884 }, // Qatar
  "642": { lat: 45.943161, lng: 24.96676 }, // Romania
  "643": { lat: 61.52401, lng: 105.318756 }, // Russia
  "646": { lat: -1.940278, lng: 29.873888 }, // Rwanda
  "682": { lat: 23.885942, lng: 45.079162 }, // Saudi Arabia
  "729": { lat: 12.862807, lng: 30.217636 }, // Sudan
  "686": { lat: 14.497401, lng: -14.452362 }, // Senegal
  "702": { lat: 1.352083, lng: 103.819836 }, // Singapore
  "222": { lat: 13.794185, lng: -88.89653 }, // El Salvador
  "688": { lat: 44.016521, lng: 21.005859 }, // Serbia
  "703": { lat: 48.669026, lng: 19.699024 }, // Slovakia
  "705": { lat: 46.151241, lng: 14.995463 }, // Slovenia
  "752": { lat: 60.128161, lng: 18.643501 }, // Sweden
  "748": { lat: -26.522503, lng: 31.465866 }, // Eswatini
  "148": { lat: 15.454166, lng: 18.732207 }, // Chad
  "768": { lat: 8.619543, lng: 0.824782 }, // Togo
  "764": { lat: 15.870032, lng: 100.992541 }, // Thailand
  "762": { lat: 38.861034, lng: 71.276093 }, // Tajikistan
  "795": { lat: 38.969719, lng: 59.556278 }, // Turkmenistan
  "780": { lat: 10.691803, lng: -61.222503 }, // Trinidad and Tobago
  "788": { lat: 33.886917, lng: 9.537499 }, // Tunisia
  "792": { lat: 38.963745, lng: 35.243322 }, // Turkiye
  "834": { lat: -6.369028, lng: 34.888822 }, // Tanzania
  "800": { lat: 1.373333, lng: 32.290275 }, // Uganda
  "804": { lat: 48.379433, lng: 31.16558 }, // Ukraine
  "858": { lat: -32.522779, lng: -55.765835 }, // Uruguay
  "840": { lat: 39.8283, lng: -98.5795 }, // USA
  "860": { lat: 41.377491, lng: 64.585262 }, // Uzbekistan
  "862": { lat: 6.42375, lng: -66.58973 }, // Venezuela
  "704": { lat: 14.058324, lng: 108.277199 }, // Vietnam
  "887": { lat: 15.552727, lng: 48.516388 }, // Yemen
  "710": { lat: -30.559482, lng: 22.937506 }, // South Africa
  "894": { lat: -13.133897, lng: 27.849332 }, // Zambia
  "716": { lat: -19.015438, lng: 29.154857 }, // Zimbabwe
  "158": { lat: 23.69781, lng: 120.960515 }, // Taiwan
};

// Types
interface CountryExportData {
  countryId: number;
  countryName: string;
  products: Array<{
    productId: number;
    productName: string;
    exportValue: number;
    exportRca: number;
    clusterId?: number;
    supplyChainId?: number;
  }>;
  totalExportValue: number;
  coordinates: { lat: number; lng: number };
}

const CirclePackMapExperiment: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [selectedSupplyChain, setSelectedSupplyChain] = useState<string>("all");
  const [rcaThreshold, setRcaThreshold] = useState<number>(1.0);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapUpdateTrigger, setMapUpdateTrigger] = useState<number>(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Clean up any problematic overlay elements
  useEffect(() => {
    const cleanupOverlays = () => {
      // Find and hide any canvas elements with extremely high z-index
      const problematicElements = document.querySelectorAll(
        'canvas[style*="z-index: 1000000000"], div[style*="z-index: 1000000000"]',
      );

      problematicElements.forEach((element) => {
        (element as HTMLElement).style.display = "none";
        (element as HTMLElement).style.pointerEvents = "none";
      });
    };

    // Initial cleanup
    cleanupOverlays();

    // Periodic cleanup in case new elements are added
    const interval = setInterval(cleanupOverlays, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // GraphQL queries
  const { data: countriesData, loading: countriesLoading } =
    useQuery(GET_COUNTRIES);
  const { data: productsData, loading: productsLoading } =
    useQuery(GET_PRODUCTS);
  const { data: clustersData, loading: clustersLoading } =
    useQuery(GET_CLUSTERS);
  const { data: supplyChainsData, loading: supplyChainsLoading } =
    useQuery(GET_SUPPLY_CHAINS);
  const { data: mappingsData, loading: mappingsLoading } = useQuery(
    GET_ALL_SUPPLY_CHAIN_MAPPINGS,
  );

  // Use a stable array of all possible country IDs to maintain hooks order
  const ALL_COUNTRY_IDS = Object.keys(COUNTRY_COORDINATES).map(Number);

  // Query country data for all countries with coordinates (but skip if not in database)
  const countryDataQueries = ALL_COUNTRY_IDS.map((countryId: number) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery(GET_COUNTRY_PRODUCT_DATA, {
      variables: { year: selectedYear, countryId },
      skip: !countriesData?.ggLocationCountryList?.some(
        (c: any) => c.countryId === countryId,
      ),
    });
  });

  const loading =
    countriesLoading ||
    productsLoading ||
    clustersLoading ||
    supplyChainsLoading ||
    mappingsLoading ||
    countryDataQueries.some((query: any) => query.loading);

  // Create lookups
  const { countryLookup, productLookup, clusterLookup, mappingLookup } =
    useMemo(() => {
      const countryLookup = new Map();
      const productLookup = new Map();
      const clusterLookup = new Map();
      const supplyChainLookup = new Map();
      const mappingLookup = new Map();

      if (countriesData?.ggLocationCountryList) {
        countriesData.ggLocationCountryList.forEach((country: any) => {
          countryLookup.set(country.countryId, country);
        });
      }

      if (productsData?.ggProductList) {
        productsData.ggProductList.forEach((product: any) => {
          productLookup.set(product.productId, product);
        });
      }

      if (clustersData?.ggClusterList) {
        clustersData.ggClusterList.forEach((cluster: any) => {
          clusterLookup.set(cluster.clusterId, cluster);
        });
      }

      if (supplyChainsData?.ggSupplyChainList) {
        supplyChainsData.ggSupplyChainList.forEach((supplyChain: any) => {
          supplyChainLookup.set(supplyChain.supplyChainId, supplyChain);
        });
      }

      if (mappingsData) {
        Object.keys(mappingsData).forEach((key) => {
          if (mappingsData[key]) {
            mappingsData[key].forEach((mapping: any) => {
              if (!mappingLookup.has(mapping.productId)) {
                mappingLookup.set(mapping.productId, []);
              }
              mappingLookup.get(mapping.productId).push(mapping);
            });
          }
        });
      }

      return {
        countryLookup,
        productLookup,
        clusterLookup,
        mappingLookup,
      };
    }, [
      countriesData,
      productsData,
      clustersData,
      supplyChainsData,
      mappingsData,
    ]);

  // Process country export data
  const countryExportData = useMemo(() => {
    if (loading || !countryLookup.size) return [];

    const data: CountryExportData[] = [];

    countryDataQueries.forEach((query: any, index: number) => {
      const countryId = ALL_COUNTRY_IDS[index];
      const country = countryLookup.get(countryId);
      const coordinates = COUNTRY_COORDINATES[countryId.toString()];

      // Skip if query was skipped, no data, or country not in database
      if (!query.data?.ggCpyList || !country || !coordinates || query.loading)
        return;

      const products = query.data.ggCpyList
        .filter((item: any) => {
          // Filter by RCA threshold
          if (item.exportRca < rcaThreshold) return false;

          // Filter by cluster/supply chain selection
          const mappings = mappingLookup.get(item.productId) || [];

          if (selectedCluster !== "all") {
            const hasCluster = mappings.some(
              (m: any) => m.clusterId === parseInt(selectedCluster),
            );
            if (!hasCluster) return false;
          }

          if (selectedSupplyChain !== "all") {
            const hasSupplyChain = mappings.some(
              (m: any) => m.supplyChainId === parseInt(selectedSupplyChain),
            );
            if (!hasSupplyChain) return false;
          }

          return true;
        })
        .map((item: any) => {
          const product = productLookup.get(item.productId);
          const mappings = mappingLookup.get(item.productId) || [];
          const mapping = mappings[0]; // Use first mapping for cluster/supply chain info

          return {
            productId: item.productId,
            productName:
              product?.nameShortEn ||
              product?.nameEn ||
              `Product ${item.productId}`,
            exportValue: parseFloat(item.exportValue) || 0,
            exportRca: parseFloat(item.exportRca) || 0,
            clusterId: mapping?.clusterId,
            supplyChainId: mapping?.supplyChainId,
          };
        });

      const totalExportValue = products.reduce(
        (sum: number, p: any) => sum + p.exportValue,
        0,
      );

      if (products.length > 0) {
        data.push({
          countryId,
          countryName: country.nameShortEn || country.nameEn,
          products,
          totalExportValue,
          coordinates,
        });
      }
    });

    return data.sort((a, b) => b.totalExportValue - a.totalExportValue);
  }, [
    countryDataQueries,
    countryLookup,
    productLookup,
    mappingLookup,
    selectedCluster,
    selectedSupplyChain,
    rcaThreshold,
    loading,
  ]);

  // Create circle pack layout for each country
  const circlePackData = useMemo(() => {
    if (!countryExportData.length) return [];

    const maxTotalValue = Math.max(
      ...countryExportData.map((d) => d.totalExportValue),
    );
    const radiusScale = scaleSqrt().domain([0, maxTotalValue]).range([10, 60]);
    const colorScale = scaleOrdinal(schemeCategory10);

    return countryExportData.map((countryData) => {
      // Group products by cluster for hierarchical packing
      const clusterGroups = new Map();

      countryData.products.forEach((product: any) => {
        const clusterId = product.clusterId || "unknown";
        if (!clusterGroups.has(clusterId)) {
          clusterGroups.set(clusterId, []);
        }
        clusterGroups.get(clusterId).push(product);
      });

      // Create hierarchy for circle packing
      const hierarchyData = {
        id: `country-${countryData.countryId}`,
        children: Array.from(clusterGroups.entries()).map(
          ([clusterId, products]) => {
            const cluster = clusterLookup.get(parseInt(clusterId as string));
            return {
              id: `cluster-${clusterId}`,
              name: cluster?.clusterName || `Cluster ${clusterId}`,
              children: products.map((product: any) => ({
                id: `product-${product.productId}`,
                name: product.productName,
                value: product.exportValue,
                data: product,
              })),
            };
          },
        ),
      };

      const root = hierarchy(hierarchyData)
        .sum((d: any) => d.value || 0)
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

      const baseRadius = radiusScale(countryData.totalExportValue);
      const packLayout = pack<any>()
        .size([baseRadius * 2, baseRadius * 2])
        .padding(2);

      const packedRoot = packLayout(root);

      return {
        countryData,
        packedRoot,
        baseRadius,
        colorScale,
      };
    });
  }, [countryExportData, clusterLookup, mapUpdateTrigger]);

  // Convert geographic coordinates to screen coordinates
  const getScreenCoordinates = (lat: number, lng: number) => {
    if (!mapInstance) return { x: 0, y: 0 };

    try {
      const point = mapInstance.project([lng, lat]);
      return { x: point.x, y: point.y };
    } catch (error) {
      return { x: 0, y: 0 };
    }
  };

  // Handle map callback and setup event listeners
  const handleMapCallback = (map: any) => {
    setMapInstance(map);

    // Clean up previous listeners if they exist
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Force re-render of overlays when map moves or zooms
    const handleMapUpdate = () => {
      setMapUpdateTrigger((prev) => prev + 1);
    };

    map.on("moveend", handleMapUpdate);
    map.on("zoomend", handleMapUpdate);
    map.on("resize", handleMapUpdate);

    // Initial trigger to position circles correctly
    handleMapUpdate();

    // Store cleanup function
    cleanupRef.current = () => {
      map.off("moveend", handleMapUpdate);
      map.off("zoomend", handleMapUpdate);
      map.off("resize", handleMapUpdate);
    };
  };

  // Event handlers
  const handleYearChange = (event: SelectChangeEvent) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const handleClusterChange = (event: SelectChangeEvent) => {
    setSelectedCluster(event.target.value);
  };

  const handleSupplyChainChange = (event: SelectChangeEvent) => {
    setSelectedSupplyChain(event.target.value);
  };

  const handleRcaThresholdChange = (
    _event: Event,
    newValue: number | number[],
  ) => {
    setRcaThreshold(newValue as number);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PageContainer>
          <Typography variant="h4" gutterBottom>
            Circle Pack Map Experiment
          </Typography>
          <div
            style={{ padding: "40px", textAlign: "center", color: "#6c757d" }}
          >
            Loading data...
          </div>
        </PageContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullWidthContent>
        <PageContainer>
          <Typography variant="h4" gutterBottom>
            Circle Pack Map Experiment
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Explore the spatial clustering of green growth exports using circle
            pack overlays on a world map. Each country shows a circle pack
            visualization where circle size represents export value and color
            represents different clusters.
          </Typography>

          <ControlsContainer>
            <Box display="flex" gap={3} flexWrap="wrap" alignItems="center">
              <FormControl size="small" style={{ minWidth: 120 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear.toString()}
                  onChange={handleYearChange}
                >
                  {Array.from({ length: 11 }, (_, i) => 2022 - i).map(
                    (year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>

              <FormControl size="small" style={{ minWidth: 180 }}>
                <InputLabel>Cluster</InputLabel>
                <Select value={selectedCluster} onChange={handleClusterChange}>
                  <MenuItem value="all">All Clusters</MenuItem>
                  {clustersData?.ggClusterList?.map((cluster: any) => (
                    <MenuItem key={cluster.clusterId} value={cluster.clusterId}>
                      {cluster.clusterName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" style={{ minWidth: 180 }}>
                <InputLabel>Supply Chain</InputLabel>
                <Select
                  value={selectedSupplyChain}
                  onChange={handleSupplyChainChange}
                >
                  <MenuItem value="all">All Supply Chains</MenuItem>
                  {supplyChainsData?.ggSupplyChainList?.map(
                    (supplyChain: any) => (
                      <MenuItem
                        key={supplyChain.supplyChainId}
                        value={supplyChain.supplyChainId}
                      >
                        {supplyChain.supplyChain}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>

              <Box style={{ minWidth: 200 }}>
                <Typography gutterBottom>
                  RCA Threshold: {rcaThreshold.toFixed(1)}
                </Typography>
                <Slider
                  value={rcaThreshold}
                  onChange={handleRcaThresholdChange}
                  min={0}
                  max={5}
                  step={0.1}
                  size="small"
                />
              </Box>
            </Box>

            <StatsContainer>
              <StatsText>
                Showing {countryExportData.length} countries with qualifying
                exports
              </StatsText>
              <StatsText>
                Total products displayed:{" "}
                {countryExportData.reduce(
                  (sum, d) => sum + d.products.length,
                  0,
                )}
              </StatsText>
            </StatsContainer>
          </ControlsContainer>

          <MapContainer ref={mapContainerRef}>
            <DefaultMap
              allowZoom={true}
              allowPan={true}
              mapCallback={handleMapCallback}
              center={[0, 20] as any}
              zoom={[2] as any}
            />

            <CirclePackOverlay>
              <svg
                width="100%"
                height="100%"
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                {circlePackData.map(
                  ({ countryData, packedRoot, colorScale }) => {
                    const screenCoords = getScreenCoordinates(
                      countryData.coordinates.lat,
                      countryData.coordinates.lng,
                    );

                    return (
                      <g
                        key={`country-${countryData.countryId}`}
                        transform={`translate(${screenCoords.x}, ${screenCoords.y})`}
                      >
                        {/* Render packed circles */}
                        {packedRoot
                          .descendants()
                          .map((node: any, index: number) => {
                            if (!node.r) return null;

                            const isLeaf = !node.children;
                            const color = isLeaf
                              ? colorScale(node.parent?.data.id || index)
                              : "none";
                            const stroke = isLeaf
                              ? "white"
                              : colorScale(node.data.id || index);
                            const strokeWidth = isLeaf ? 1 : 2;
                            const fillOpacity = isLeaf ? 0.8 : 0;
                            const strokeOpacity = isLeaf ? 1 : 0.6;

                            return (
                              <circle
                                key={node.data.id}
                                cx={node.x - packedRoot.r}
                                cy={node.y - packedRoot.r}
                                r={node.r}
                                fill={color}
                                fillOpacity={fillOpacity}
                                stroke={stroke}
                                strokeWidth={strokeWidth}
                                strokeOpacity={strokeOpacity}
                              >
                                <title>
                                  {isLeaf
                                    ? `${node.data.name}: $${(node.value / 1000000).toFixed(1)}M`
                                    : `${node.data.name}: ${node.children?.length || 0} products`}
                                </title>
                              </circle>
                            );
                          })}

                        {/* Country label */}
                        <text
                          x={0}
                          y={packedRoot.r + 20}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#333"
                          fontWeight="bold"
                        >
                          {countryData.countryName}
                        </text>
                      </g>
                    );
                  },
                )}
              </svg>
            </CirclePackOverlay>
          </MapContainer>

          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              About This Visualization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This experimental visualization overlays circle pack diagrams on a
              world map to show the spatial distribution of green growth
              exports. Each country displays a hierarchical circle pack where:
            </Typography>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Circle size represents export value
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Colors represent different clusters within value chains
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Hierarchy shows cluster groupings and individual products
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Only products with RCA ≥ threshold are shown (indicating
                  competitive advantage)
                </Typography>
              </li>
            </ul>
          </Box>
        </PageContainer>
      </FullWidthContent>
    </ThemeProvider>
  );
};

export default CirclePackMapExperiment;
