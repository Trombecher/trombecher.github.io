/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		colors: {
			white: "#FFF4E6",
			black: "#292626",
			red: "#FF5D41",
			yellow: "#FFDB5B",
			blue: "#2141c1",
		},
		screens: {
			xs: "420px",
			sm: "600px"
		},
		fontFamily: {
			sans: ["Inter", "system-ui", "sans-serif"], // "-apple-system", "BlinkMacSystemFont",
			mono: ["ui-monospace", "Consolas", "monospace"],
		},
		extend: {
			boxShadow: {
				button: "0 4px theme(colors.black)"
			}
		}
	},
	plugins: [
		({addComponents}) => {
			addComponents({
				".expanded": {
					fontStretch: "expanded"
				},
			})
		}
	],
}
