class Frontend extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            scrollHidden: false, 
            countDownTimer: 0,
            dominantColor: "#FFFFFF", 
            dominantColorName: "black"
        }

        this.clickEvent = this.clickEvent.bind(this);
        this.openScroll = this.openScroll.bind(this);
        this.startCountDown = this.startCountDown.bind(this);
        this.countDown = this.countDown.bind(this);

        this.webcamRef = React.createRef();
        this.scrollClass = "hidden";
        this.countDownTimer = 0;

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

    componentDidMount() {
        this.socket = io("http://localhost:8080");
        var that = this;
        this.socket.on("color_identified", (data) => {
            that.setState({
                dominantColorHex: data.dominantColorHex,
                dominantColorName: data.dominantColorName,
                generalColorHex: data.generalColorHex,
                generalColorName: data.generalColorName
            });

            console.log("dataReceived", data);

            let msg = new SpeechSynthesisUtterance()
            msg.text = data.dominantColorName

            speechSynthesis.speak(msg)
            
            this.openScroll();
        });
    }

    clickEvent(e) {
        var rect = e.target.getBoundingClientRect()
        var x = e.clientX - rect.left
        var y = e.clientY - rect.top
        
        var data = {
            img: this.webcamRef.current.getScreenshot(),
            x: x,
            y: y
        }
        
        this.socket.emit("click_event", data);
        // console.log("videoBox", data.img, rect.width, rect.height, rect.left, rect.top)
        // console.log("Mouse", e.clientX, e.clientY, x, y)
    }

    openScroll() {
        this.setState({scrollHidden: true});
        this.startCountDown();
    }

    startCountDown() {
        this.setState({countDownTimer: 5});
        if(this.countDownTimer == 0) this.countDownTimer = setInterval(this.countDown, 1000);
    }

    countDown() {
        this.setState({
            countDownTimer: this.state.countDownTimer-1
        });

        if (this.state.countDownTimer <= 0) { 
        clearInterval(this.countDownTimer);
        this.countDownTimer = 0;
        this.setState({
            countDownTimer: 0,
            scrollHidden: false
        });
        }
    }

    render() {
        var scrollClass;
        if(this.state.scrollHidden) scrollClass = "shown";
        else scrollClass = "hidden";

        return (
                <div id="video_preview">
                        {this.WebcamComponent}
                        <div id="colorScroll" className={scrollClass}>
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