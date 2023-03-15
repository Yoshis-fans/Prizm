class Frontend extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            scrollOpen: false, 
            scrollCountDownTimer: 0,
            dominantColorHex: "#000000", 
            dominantColorName: "Black"
        }

        this.clickEvent = this.clickEvent.bind(this);
        this.openScroll = this.openScroll.bind(this);
        this.countDownScroll = this.countDownScroll.bind(this);

        this.webcamRef = React.createRef();
        this.scrollClass = "hidden";
        this.scrollCountDownInterval = null;

        const videoConstraints = {
            width: 1920,
            height: 1080, //can remove later
            facingMode: "environment"
        };
          
        this.WebcamComponent =
            <Webcam
                ref={this.webcamRef}
                // height={720}
                // width={1280}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onClick={this.clickEvent}
                id="videoPlayer"
            />;
    }

    getNeighbouringColors(imgSrc, x, y, r, paletteSize) {
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
            
            let palette = getPalette(imageData, paletteSize, 1);
            palette = palette !== null ? palette : [[255,255,255]];

            this.dataProcessedCallback({
                pixelColor: getPixelColor(imageData, sw, x-sx, y-sy),
                palette: palette
            });
        }
    
        img.src = imgSrc;
    }

    clickEvent(e) {
        let rect = e.target.getBoundingClientRect()
        let x = e.clientX - rect.left
        let y = e.clientY - rect.top
        
        this.getNeighbouringColors(this.webcamRef.current.getScreenshot(), x, y, 20, 10); // TODO: Replace r and paletteSize with values from config
    }

    dataProcessedCallback(data) {
        let color = getColorFromPallete(
            data.palette[0][0], 
            data.palette[0][1],
            data.palette[0][2]
        ); // TODO: Select Palette from config
        
        this.setState({
            dominantColorName: color.English,
            dominantColorHex: color.HEX
        });

        let msg = new SpeechSynthesisUtterance() // TODO: Enable TTS from config
        msg.text = color.English;
        speechSynthesis.speak(msg);
        
        this.openScroll();
    }

    openScroll() {
        this.setState({scrollCountDownTimer: 5});
        
        if(this.state.scrollOpen === false) {
            this.setState({scrollOpen: true});
            this.scrollCountDownInterval = setInterval(this.countDownScroll, 1000);
        }
    }

    countDownScroll() {
        this.setState({
            scrollCountDownTimer: this.state.scrollCountDownTimer-1
        });

        if (this.state.scrollOpen == true && this.state.scrollCountDownTimer <= 0) { 
            clearInterval(this.scrollCountDownInterval);
            this.setState({
                scrollCountDownTimer: 0,
                scrollOpen: false
            });
        }
    }

    render() {
        var scrollClass = "scroll";
        if(this.state.scrollOpen) scrollClass += " open";

        return (
                <div id="video_preview">
                        {this.WebcamComponent}
                        <div className={scrollClass}>
                            <div>{this.state.dominantColorName}</div>
                            <div id="colorDot" style={{backgroundColor: this.state.dominantColorHex}}>
                            </div>
                        </div>
                </div>
        )
    }
}

const root = ReactDOM.createRoot(
    document.getElementById("rootdiv")
);

root.render(<Frontend />);