export default () => {
    return (
        <main class={"w-full max-w-xl p-6"}>
            <h1 class={"text-4xl font-bold mb-4 text-center tracking-tighter"}>Welcome to Link Net</h1>
            <p class={"text-xl text-shade-200 text-center"}>A decentralized link sharing network</p>
            <div>
                <button
                    class={"select-none bg-accent-600 font-semibold px-3 py-1 rounded-xl hover:bg-accent-700 active:bg-accent-800 transition"}
                >New Local Profile</button>
                <button
                    class={"select-none bg-shade-800 font-semibold px-3 py-1 rounded-xl hover:bg-shade-900 active:bg-shade-1000 transition ml-4"}
                >
                    Add Cloud Profile
                </button>
            </div>

            <h2 class={"mt-12 font-semibold text-2xl"}>Tldr;</h2>
            <p class={"mt-6 text-shade-200"}>You keep a list of links, settings and other stuff, called a <i>profile</i>. This profile is stored locally (localStorage). You can also configure an anonymous, private cloud file to sync the profile between browsers.</p>
            <p class={"mt-6 text-shade-200"}>Each link you store is queried by your client. Metadata information is displayed, as well as links this link links to. This creates a network of links, hence <i>Link Net</i>.</p>
        </main>
    );
}