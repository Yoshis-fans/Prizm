var defaultPalette = null;
const defaultPalettePath = "/palettes/colors.json";

fetch(defaultPalettePath).then((response) => response.json()).then((json) => defaultPalette = json);

function getColorFromPallete(r, g, b, palette = defaultPalette) {
    if(palette === null) new Error("Palette cannot be null");
    
    let min = 766;
    let closestColor = null;
    for(let i = 0; i < palette.length; i++) {
        let d = Math.abs(r-Number(palette[i]["R"])) + Math.abs(g-Number(palette[i]["G"])) + Math.abs(b-Number(palette[i]["B"]));

        if(d == 0) return palette[i]; // Exact match found, no need to look further
        if(d < min) { // Closer Match found, overriding closestColor
            min = d;
            closestColor = palette[i];
        }
    }

    return closestColor;
}