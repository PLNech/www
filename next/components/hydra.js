import React, { useRef, useEffect } from "react";

class HydraSynth extends React.Component {
  constructor(props) {
    super(props);
    this.width = props.width;
    this.height = props.height;
    this.source= props.source;
  }

  componentDidMount() {
    const Hydra = require('hydra-synth');
    const hydra = new Hydra({
      // canvas element to render to. If none is supplied, a canvas will be created and appended to the screen
      // canvas: this.canvasRef,
      autoLoop: true,
      makeGlobal: true,
      numSources: 4,
      detectAudio: false,
      numOutputs: 4,
    });
    hydra.setResolution(this.width, this.height);

    //TODO: Use source
    // FIXME: Canvas position
    s0.initImage("https://git.plnech.fr/pln/Hydra/raw/master/StarryNights/img/halley.png");
    src(s0).out(o0)
    src(o0)
      .modulate(src(o0),() => Math.sin(time/100) / 10)
    .out(o1)
    src(o1)
      .modulateScale(osc(1,0.4),0.05)
      .blend(noise(100,0.92).colorama(),0.07)
    .out(o2)
    src(o2)
      .blend(src(o2).thresh(), () => 0.5 + 0.125 * Math.sin(time / 100 % 180))
      .scrollX(-0.05)
      // .scrollY(-0.1)
      .scale(1.08)
    .out(o3)
    render(o3)

  }
  render() {
    return <canvas ref="{this.canvasRef}" width={this.width} height={this.height} />;
  }
}

export default HydraSynth
