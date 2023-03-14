function getNeighbouringColors(imgSrc, x, y, r, paletteSize, callback) {
    var img = new Image();

    img.onload = () => {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
    
        var canvas = new OffscreenCanvas(imgWidth, imgHeight);
        var ctx = canvas.getContext("2d");
    
        ctx.drawImage(img, 0, 0);
        
        const sx = x-r > 0 ? x-r : 0;
        const sy = y-r > 0 ? y-r : 0;
        const sw = x-sx+r < imgWidth-sx ? x-sx+r : ctx.width-sx;
        const sh = y-sy+r < imgHeight-sy ? y-sy+r : imgHeight-sy;
    
        var imageData = ctx.getImageData(sx, sy, sw, sh);
    
        callback({
            pixelColor: getPixelColor(imageData, sw, x-sx, y-sy),
            palette: getPalette(imageData, paletteSize, 1) 
        });
    }

    img.src = imgSrc;
}

function getPixelColor(imageData, width, x, y) {
    const imageDataData = imageData.data;
    const offset = (x*width+y) * 4
    
    return [
        imageDataData[offset],
        imageDataData[offset+1],
        imageDataData[offset+2],
        imageDataData[offset+3]
    ];
}


function getPalette(imageData, colorCount, quality) {
    const options = validateOptions({
        colorCount,
        quality
    });

    const pixelCount = imageData.width * imageData.height;

    const pixelArray = createPixelArray(imageData.data, pixelCount, options.quality);

    // Send array to quantize function which clusters values
    // using median cut algorithm
    const cmap    = quantize(pixelArray, options.colorCount);
    const palette = cmap ? cmap.palette() : null;

    return palette;
};
