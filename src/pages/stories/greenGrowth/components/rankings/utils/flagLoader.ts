// Dynamic country flag loader
type RequireContext = {
  keys(): string[];
  (id: string): string | { default: string };
};

const flagContext: RequireContext = (
  require as unknown as {
    context(
      directory: string,
      useSubdirectories: boolean,
      regExp: RegExp,
    ): RequireContext;
  }
).context(
  "../../../../../../assets/country_flags",
  false,
  /^\.\/Flag-.*\.(svg|png)$/,
);

export const getFlagSrc = (iso3Code?: string): string | null => {
  const keys = flagContext.keys();
  const upper = (iso3Code || "").toUpperCase();
  const candidates = [`./Flag-${upper}.svg`, `./Flag-${upper}.png`];
  for (const k of candidates) {
    if (keys.includes(k)) {
      const mod = flagContext(k);
      return typeof mod === "string" ? mod : mod.default;
    }
  }
  const fallback = "./Flag-Undeclared.png";
  if (keys.includes(fallback)) {
    const mod = flagContext(fallback);
    return typeof mod === "string" ? mod : mod.default;
  }
  return null;
};
