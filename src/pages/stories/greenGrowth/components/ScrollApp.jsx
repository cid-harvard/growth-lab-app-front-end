import { useState, useEffect, useRef, useCallback } from "react";
import Scrolly from "./visualization/Scrolly";
import ScrollIndicator from "./visualization/ScrollIndicator";
import {
  AppBar,
  Box,
  MenuItem,
  Select,
  styled,
  Toolbar,
  Autocomplete,
  TextField,
} from "@mui/material";
import { atom, useRecoilState } from "recoil";

import { countrySelectionState } from "./Story";
import { useQuery } from "@apollo/client";
import { GET_COUNTRIES } from "../queries/countries";

const StyledAppBar = styled(AppBar)({
  background:
    "linear-gradient(135deg, #0a78b8 0%, rgba(39, 204, 193, .8) 100%)",
  boxShadow: "none",
});

const Logo = styled("img")({
  height: "40px",
});

const StyledSelect = styled(Select)({
  color: "white",
  "& .MuiSelect-icon": {
    color: "white",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
});

const HeaderControls = ({
  countrySelection,
  setCountrySelection,
  yearSelection,
  setYearSelection,
}) => {
  const { data, loading, error } = useQuery(GET_COUNTRIES);
  const countries = data?.ggLocationCountryList || [];
  const availableYears = Array.from({ length: 11 }, (_, i) => 2022 - i);

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Box display="flex" alignItems="center" width="100%">
          <Box flexGrow={1} display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center">
              <Autocomplete
                disableClearable
                value={
                  countries.find(
                    (country) => country.countryId === countrySelection,
                  ) || null
                }
                onChange={(event, newValue) => {
                  setCountrySelection(newValue ? newValue.countryId : null);
                }}
                options={countries}
                getOptionLabel={(option) => option.nameEn}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Select a country"
                    size="small"
                  />
                )}
                sx={{
                  width: 200,
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                    "&:hover fieldset": { borderColor: "white" },
                  },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiAutocomplete-popupIndicator": { color: "white" },
                  "& .MuiAutocomplete-clearIndicator": { color: "white" },
                }}
              />
            </Box>
            <Box display="flex" alignItems="center">
              <StyledSelect
                value={yearSelection}
                onChange={(e) => setYearSelection(e.target.value)}
                size="small"
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </StyledSelect>
            </Box>
          </Box>
          <Logo src="/img/GL_logo_white.png" alt="Growth Lab" />
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export const yearSelectionState = atom({
  key: "yearSelectionState",
  default: "2022",
});

const ScrollApp = ({ inView }) => {
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState("down");
  const [countrySelection, setCountrySelection] = useRecoilState(
    countrySelectionState,
  );
  const [yearSelection, setYearSelection] = useRecoilState(yearSelectionState);

  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const resetTimeoutRef = useRef(null);

  const totalSteps = 8;
  const scrollThreshold = 100;
  const scrollResetDelay = 1000;

  const changeStep = useCallback(
    (direction) => {
      if (inView) {
        setStep((prevStep) => {
          const nextStep = prevStep + direction;
          setPrevStep(prevStep);
          return Math.max(0, Math.min(nextStep, totalSteps - 1));
        });
      }
    },
    [inView],
  );

  const handleStepChange = (newStep) => {
    if (inView) {
      setStep((prevStep) => {
        setPrevStep(prevStep);
        return Math.max(0, Math.min(newStep, totalSteps - 1));
      });
    }
  };

  const handleScroll = (delta) => {
    if (isScrollingRef.current) return;

    setScrollProgress(Math.min(Math.abs(delta) / scrollThreshold, 1));
    setScrollDirection(delta > 0 ? "down" : "up"); // Set scroll direction

    if (Math.abs(delta) >= scrollThreshold) {
      const stepDirection = delta > 0 ? 1 : -1;
      changeStep(stepDirection);
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        setScrollProgress(0);
      }, scrollResetDelay);
    } else {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

      resetTimeoutRef.current = setTimeout(() => {
        setScrollProgress(0);
      }, scrollResetDelay);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        changeStep(1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        changeStep(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeStep]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;

    const handleWheel = (e) => {
      e.preventDefault();
      handleScroll(e.deltaY);
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      handleScroll(deltaY);
      touchStartY = touchEndY;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, [inView]);

  return (
    <div style={{ height: "100vh" }} ref={containerRef} className="scroll-app">
      <HeaderControls
        countrySelection={countrySelection}
        setCountrySelection={setCountrySelection}
        yearSelection={yearSelection}
        setYearSelection={setYearSelection}
      />
      <ScrollIndicator progress={scrollProgress} direction={scrollDirection} />
      <Scrolly
        inView={inView}
        step={step}
        prevStep={prevStep}
        onStepChange={handleStepChange}
        onScroll={handleScroll}
        scrollThreshold={scrollThreshold}
        countrySelection={countrySelection}
        yearSelection={yearSelection}
      />
    </div>
  );
};

export default ScrollApp;
