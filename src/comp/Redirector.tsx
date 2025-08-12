export default () => {
    const url = localStorage["redirectURL"];

    location.href = (url || "/") + location.search;

    return (
        <div/>
    )
}