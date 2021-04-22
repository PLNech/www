import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"

const Hydra = () => (
  <Layout>
    <Seo title="Hydra" />
    <h1>Hydra</h1>
    <p>With <a href="https://github.com/ojack/hydra/">Hydra</a>, I create some eye-catchers:</p>
    <StaticImage
      src="../images/WIP_GaLactic.png"
      width={2048}
      quality={95}
      formats={["AUTO", "WEBP", "AVIF"]}
      alt="A Gatsby astronaut"
      style={{ marginBottom: `1.45rem` }}
    />
    <Link to="/">Home</Link>
  </Layout>
)

export default Hydra
