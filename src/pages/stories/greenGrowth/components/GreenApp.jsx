import { useState } from "react";
import ScrollApp from "./ScrollApp";
import ProductScatter from "./visualization/ProductScatter";
import ProductRadar from "./visualization/ProductRadar";
import TreeGrowth from "./visualization/TreeGrowth";

const GreenApp = () => {
  const [currentSection, setCurrentSection] = useState("intro");

  const renderSection = () => {
    switch (currentSection) {
      case "intro":
        return (
          <section className="intro">
            <h1>Welcome to the Green Growth App</h1>
            <p>
              Explore various visualizations and insights about green growth.
            </p>
            <button onClick={() => setCurrentSection("scrolly")}>
              Start Exploration
            </button>
          </section>
        );
      case "scrolly":
        return (
          <section className="scrolly-section">
            <ScrollApp
              onComplete={() => setCurrentSection("product-scatter")}
            />
          </section>
        );
      case "product-scatter":
        return (
          <section className="product-scatter">
            <h2>Product Scatter</h2>
            <ProductScatter />
            <button onClick={() => setCurrentSection("product-radar")}>
              Next
            </button>
          </section>
        );
      case "product-radar":
        return (
          <section className="product-radar">
            <h2>Product Radar</h2>
            <ProductRadar />
            <button onClick={() => setCurrentSection("tree-growth")}>
              Next
            </button>
          </section>
        );
      case "tree-growth":
        return (
          <section className="tree-growth">
            <h2>Tree Growth</h2>
            <TreeGrowth />
            <button onClick={() => setCurrentSection("conclusion")}>
              Next
            </button>
          </section>
        );
      case "conclusion":
        return (
          <section className="conclusion">
            <h1>Conclusion</h1>
            <p>Summary of insights and call to action.</p>
            <button onClick={() => setCurrentSection("intro")}>Restart</button>
          </section>
        );
      default:
        return null;
    }
  };

  return <div className="green-app">{renderSection()}</div>;
};

export default GreenApp;
