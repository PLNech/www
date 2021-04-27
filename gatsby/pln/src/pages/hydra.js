import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"
import HydraSynth from "../components/hydra-synth"


const Hydra = () => (
  <Layout>
    <Seo title="Hydra" />
    <HydraSynth canvasId="myCanvas"/>
    <h1>Hydra</h1>
    <p>With <a href="https://github.com/ojack/hydra/">Hydra</a>, I create some eye-catchers:</p>
    <canvas id="canvas"/>
    <h2>Work Process</h2>
    <StaticImage
      src="../images/WIP_GaLactic.png"
      width={2048}
      quality={95}
      formats={["AUTO", "WEBP", "AVIF"]}
      alt="A screenshot of four intermediary steps of the GaLactic work"
      style={{ marginBottom: `1.45rem` }}
    />
    <Link to="/">Home</Link>
  </Layout>
)

export default Hydra
