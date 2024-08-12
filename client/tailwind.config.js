/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,svg}"],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      maxWidth: {
        "1/2": "50%",
      },
      fontFamily: {
        emoji: [
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "sans-serif",
          "Noto Color Emoji",
          "Android Emoji",
        ],
      },
      backgroundImage: {
        "hero-bg": "url('/public/images/hero_bg.webp')",
        "tactile-noise": "url('/public/images/tactile_noise.png')",
      },
    },
  },

  plugins: [],
};
