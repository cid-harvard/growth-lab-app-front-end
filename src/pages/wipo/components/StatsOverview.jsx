import { Grid, Typography } from "@mui/material";
import { incomeGroups } from "../routes/country/Remuneration/utils";
import { addOrdinalSuffix, dimensions } from "./utils";
import { sum } from "d3-array";

const extractStrengthStats = (stats) => [
  {
    title: "Share of Innovation:",
    value: (
      <>
        {Object.entries(stats.capabilities_by_type).map(([capability, d]) => (
          <div key={capability}>
            {dimensions[capability].label}: {(d.percentage * 100).toFixed(0)}%
          </div>
        ))}
      </>
    ),
  },
  {
    title: "World Innovation Ranking:",
    value: (
      <div>
        {addOrdinalSuffix(stats.total_capabilities.rank)} /{" "}
        {stats.total_capabilities.total_countries}
      </div>
    ),
  },
  {
    title: "Regional Innovation Ranking:",
    value: (
      <>
        {stats.regional_rank.region}
        <div>
          {addOrdinalSuffix(stats.regional_rank.rank)} /{" "}
          {stats.regional_rank.total}
        </div>
      </>
    ),
  },
  {
    title: "Income Group Innovation Ranking:",
    value: (
      <>
        {`${incomeGroups[stats.income_group_rank.income_group].name} Income`}
        <div>
          {addOrdinalSuffix(stats.income_group_rank.rank)} /{" "}
          {stats.income_group_rank.total}
        </div>
      </>
    ),
  },
];

const Statistic = ({ title, value }) => (
  <Grid item xs={12} sm={6} md={4} lg={2}>
    <Typography
      component="div"
      align="center"
      sx={{ color: "#124E66", fontSize: "14px", fontWeight: 600 }}
    >
      <div>
        <b>{title}</b>
      </div>

      {value}
    </Typography>
  </Grid>
);

const extractRemunerationStats = (stats) => [
  {
    title: `Diversity of all innovation capabilities:`,
    value: `(${stats?.total_capabilities?.value} / ${stats?.total_capabilities?.out_of} capabilities)`,
  },
  ...Object.entries(stats.capabilities_by_type).map(([capability, d]) => ({
    title: `${dimensions[capability]?.adjective} Diversity`,
    value: (
      <>
        <div>
          {" "}
          ({d.value} / {d.out_of} capabilities)
        </div>
        <div>
          {`Global Rank ${addOrdinalSuffix(d.rank)} / ${d.total_countries}`}
        </div>
      </>
    ),
  })),
  // {
  //   title: "World Diversity Ranking:",
  //   value: (
  //     <div>
  //       {stats.total_capabilities.rank} /{" "}
  //       {stats.total_capabilities.total_countries}
  //     </div>
  //   ),
  // },
  // {
  //   title: "Regional Diversity Ranking:",
  //   value: (
  //     <>
  //       {stats.regional_rank.region}
  //       <div>
  //         {stats.regional_rank.rank} / {stats.regional_rank.total}
  //       </div>
  //     </>
  //   ),
  // },
  // {
  //   title: "Income Group Diversity Ranking:",
  //   value: (
  //     <>
  //       {`${incomeGroups[stats.income_group_rank.income_group].name} Income`}
  //       <div>
  //         {stats.income_group_rank.rank} / {stats.income_group_rank.total}
  //       </div>
  //     </>
  //   ),
  // },
];

const extractReccomendationStats = (stats, data) => {
  const totalValue = sum(data, ({ value }) => value);
  const totalExpectedValue = sum(data, ({ expected_value }) => expected_value);
  const totalExpectedValueParsed = parseInt(totalExpectedValue);
  const achievedPercentage = ((totalValue / totalExpectedValue) * 100).toFixed(
    0,
  );

  return [
    {
      title: "Share of achieved potential:",
      value: `${totalValue.toLocaleString("en-US")} patents out of ${totalExpectedValueParsed.toLocaleString("en-US")} expected (${achievedPercentage}%)`,
    },
  ];
};

const statsForPage = {
  strengths: extractStrengthStats,
  capabilities: () => [],
  remuneration: extractRemunerationStats,
  reccomendations: extractReccomendationStats,
};

const StatsOverview = ({ stats, data }) => {
  const page = location.pathname.split("/")[4];
  const pageStats = statsForPage[page](stats, data) || [];

  return (
    <Grid
      container
      spacing={1}
      justifyContent="space-around"
      alignItems="center"
    >
      {pageStats.map((stat, index) => (
        <Statistic key={index} title={stat.title} value={stat.value} />
      ))}
    </Grid>
  );
};

export default StatsOverview;
