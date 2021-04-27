import PropTypes from "prop-types"

const Hydra = require('hydra-synth')

function HydraSynth({ canvasId }) {
  const hydra = new Hydra({
    canvas: document.getElementById(canvasId),
    detectAudio: false,
    makeGlobal: true })

  const synth = hydra.synth

  synth.osc(4, 0.1, 1.2).out()

  return null
}
HydraSynth.defaultProps = {
  canvasId: `canvas`,
}

HydraSynth.propTypes = {
  canvasId: PropTypes.string.isRequired,
}

export default HydraSynth
