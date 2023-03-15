var defaultPalette = null;
const defaultPalettePath = "/palettes/colors.json";

fetch(defaultPalettePath).then((response) => response.json()).then((json) => defaultPalette = json);

function getColorFromPallete(r, g, b, palette = defaultPalette) {
    if(palette === null) new Error("Palette cannot be null");
    
    let min = 442;
    let closestColor = null;
    for(let i = 0; i < palette.length; i++) {
        let d = Math.sqrt(
            Math.pow(r-Number(palette[i]["R"]), 2) + 
            Math.pow(g-Number(palette[i]["G"]), 2) + 
            Math.pow(b-Number(palette[i]["B"]), 2)
            );

        if(d == 0) { // Exact match found, no need to look further
            closestColor = Object.assign({}, palette[i]);
            closestColor["d"] = 0;
            return closestColor; 
        }
        if(d < min) { // Closer Match found, overriding closestColor
            min = d;
            closestColor = Object.assign({}, palette[i]);
            closestColor["d"] = d;
        }
    }

    return closestColor;
}