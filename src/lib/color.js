var colors = [
  "#ff0000",
  "#800080",
  "#ff00ff",
  "#008000",
  "#00ff00",
  "#808000",
  "#000080",
  "#0000ff",
  "#006400",
  "#8a2be2",
  "#a52a2a",
  "#deb887",
  "#5f9ea0",
  "#7fff00",
  "#d2691e",
  "#ff7f50",
  "#6495ed",
  "#00008b",
  "#008b8b",
  "#b8860b",
  "#00ffff ",
  "#8b008b",
  "#556b2f",
  "#ff8c00",
  "#9932cc",
  "#8b0000",
  "#e9967a",
  "#8fbc8f",
  "#00ced1",
  "#9400d3",
  "#ff1493",
  "#00bfff",
  "#9acd32",
  "#ff6347",
  "#ee82ee",
];
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getRandomColors(length = 0) {
  // var colors = [];
  let unique = new Set();
  for (var i = 0; i <= length; i++) {
    // unique.add(getRandomColor());
    // colors.push(getRandomColor());
    unique.add(colors[i]);
  }
  // var uniqueColors = Array.from(unique);
  // console.log("uniqueColors",uniqueColors);
  return Array.from(unique);
}
