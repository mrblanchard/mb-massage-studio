import {
  Bebas_Neue,
  Inter,
  Instrument_Serif,
  Newsreader,
  Nunito,
  Playfair_Display,
  Poppins,
} from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});

export const fontRegistry = {
  Inter: { cssVar: "--font-inter", headingWeight: 600, loader: inter },
  "Instrument Serif": { cssVar: "--font-instrument-serif", headingWeight: 400, loader: instrumentSerif },
  Newsreader: { cssVar: "--font-newsreader", headingWeight: 500, loader: newsreader },
  Poppins: { cssVar: "--font-poppins", headingWeight: 600, loader: poppins },
  "Playfair Display": { cssVar: "--font-playfair-display", headingWeight: 600, loader: playfairDisplay },
  Nunito: { cssVar: "--font-nunito", headingWeight: 700, loader: nunito },
  "Bebas Neue": { cssVar: "--font-bebas-neue", headingWeight: 400, loader: bebasNeue },
} as const;

export type FontName = keyof typeof fontRegistry;
export const fontOptions = Object.keys(fontRegistry) as FontName[];

export function fontVariableClassNames(): string {
  return Object.values(fontRegistry)
    .map((f) => f.loader.variable)
    .join(" ");
}

export function resolveFont(name: string | null | undefined) {
  return fontRegistry[name as FontName] ?? fontRegistry.Inter;
}
