/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.astro"],
	theme: {
        colors: {
            "white": "#fff",
            "black": "#000",
            "blue": "#0077ff"
        },
		fontFamily: {
            sans: ["system-ui", "sans-serif"]
        }
	}
}
