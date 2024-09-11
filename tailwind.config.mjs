/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.astro"],
	theme: {
        colors: {
            "white": "rgb(var(--white) / <alpha-value>)",
            "black": "rgb(var(--black) / <alpha-value>)",
            "blue": "rgb(var(--blue) / <alpha-value>)",
            "red": "#f00",
            "yellow": "#ff0",
            "green": "#0f0"
        },
		fontFamily: {
            sans: ["system-ui", "sans-serif"],
            mono: ["Jetbrains Mono", "Consolas", "monospace"]
        }
	},
    plugins: [
        ({addComponents, theme}) => {
            addComponents({
                ".expanded": {
                    fontStretch: "expanded"
                }
            })
        }
    ]
}
