/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      noScrollbar: {
        "&::-webkit-scrollbar": {
          width: "0px",
          height: "8px", // Keep horizontal scrollbar height if needed
        },
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
      },
      colors: {
        // primaryColor: "#0055AD", // Navy blue
        primaryColor: "#1D1DA4", // Navy blue
        primaryFadedColor: "#064585", // Lighter version of navy blue
        accentColor: "#8cc441",

        primaryTextColor: "#191919", // Dark neutral text (better than pure black)
        secondaryTextColor: "#686868", // Muted gray for secondary text

        primaryBtnColor: "#004680", // Button color — slightly darker than main
        primaryBtnHoverColor: "#00365f", // Even darker for hover

        skeletonLoaderColor: "#e5e7eb", // Light neutral gray (tailwind's gray-200)
      },
      fontFamily: {
        BeVietnamPro: ['"Be Vietnam Pro"', "sans-serif"],
        // DmSans: ['"DM Sans"', "sans-serif"],
        // SpaceGrotesk: ['"Space Grotesk"', "sans-serif"],
        // KumbhSans: ['"Kumbh Sans"', "sans-serif"],
        // Outfit: ['"Outfit"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
