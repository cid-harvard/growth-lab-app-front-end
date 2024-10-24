import { Suspense, useRef, useMemo } from "react";
import Landing from "./Landing";
import ScrollApp from "./ScrollApp";
import { atom } from "recoil";
import { useInView } from "react-intersection-observer";
import ProductScatter from "./visualization/ProductScatter";

export const countrySelectionState = atom({
  key: "countrySelectionState",
  default: "31",
});

const Story = () => {
  const scrollAppRef = useRef(null);
  const { ref, inView, entry } = useInView({
    threshold: 0.9,
  });
  const handleExplore = () => {
    scrollAppRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const memoizedInView = useMemo(() => inView, [inView]);
  return (
    <div className="appRoot">
      <Landing onExplore={handleExplore} />
      <Suspense fallback={null}>
        <ProductScatter />
      </Suspense>
      <Suspense fallback={null}>
        <div
          ref={(el) => {
            scrollAppRef.current = el;
            ref(el);
          }}
          style={{ height: "100vh", overflow: "hidden" }}
        >
          <ScrollApp inView={memoizedInView} />
        </div>
      </Suspense>
    </div>
  );
};

export default Story;
