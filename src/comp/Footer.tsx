import {type JSX} from "solid-js";

const Link = ({children, class: className, ...rest}: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...rest} class={`${className} underline text-blue hover:no-underline`}>{children}</a>
);

export default () => (
    <footer class={`mt-auto text-sm flex flex-col items-center text-black/80 select-none px-6 py-6 pt-24`}>
        <svg viewBox="0 0 64 16" width="64" height="16" class="">
            <path d="M0 0v16h16V0Z" class="fill-red"/>
            <path d="M16 0v16h16V0Z" class="fill-yellow"/>
            <path d="M32 0v16h16V0Z" class="fill-blue"/>
            <path d="M48 0v16h16V0Z" class="fill-black"/>
        </svg>
        <p class="my-4">&copy; {new Date().getFullYear()} Tobias Hillemanns. All rights reserved.</p>
        <p class={"text-center"}>
            Built with <Link href="https://astro.build/">Astro</Link> + <Link href="https://docs.solidjs.com/">Solid</Link> + <Link href="https://tailwindcss.com/">TailwindCSS</Link><br/>
            Hosted by <Link href="https://pages.github.com/">GitHub Pages</Link> ❤️
        </p>
        <p class={"mt-4"}>
            <Link href={"/privacy-policy/"}>Privacy Policy</Link> · <Link href={"/imprint/"}>Imprint</Link>
        </p>
    </footer>
);