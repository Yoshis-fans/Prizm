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
