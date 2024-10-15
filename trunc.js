const MAX_LINES = 10000;

const content = await Bun.file("rockyou.txt").text();
const lines = content.split("\n");
lines.splice(MAX_LINES, lines.length - MAX_LINES);
await Bun.write("rockyou-10000.txt", lines.join("\n"));