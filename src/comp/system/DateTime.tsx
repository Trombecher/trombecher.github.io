export default ({date}: {date: Date}) => (
    <time dateTime={date.toISOString()}>{date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })}</time>
)