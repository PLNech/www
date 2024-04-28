import React, { useRef, useEffect } from "react";


class HydraSynth extends React.Component {
  constructor(props) {
    super(props);
    this.width = props.width;
    this.height = props.height;
    this.source= props.source;
    // FIXME: Webgl not supported if I use this??
    // this.canvasRef = props.canvasRef;
  }

  componentDidMount() {
    import('hydra-synth').then((Hydra) => {
      console.log(this.canvasRef);
      const hydra = new Hydra.default({
        // canvas element to render to. If none is supplied,
        // a canvas will be created and appended to the screen
        canvas: this.canvasRef,
        autoLoop: true,
        makeGlobal: true,
        numSources: 4,
        detectAudio: false,
        numOutputs: 4,
      });
      hydra.setResolution(this.width, this.height);
      hydra.eval(this.source);
    });
  }
  render() {
    return <div>
      {/* <canvas ref="{this.canvasRef}" width={this.width} height={this.height} /> */}
      </div>;
  }
}

export default HydraSynth
