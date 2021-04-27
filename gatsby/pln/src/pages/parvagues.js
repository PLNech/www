import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const ParVagues = () => (
  <Layout>
    <Seo title="ParVagues" />
    <h1>ParVagues</h1>
    <p>ParVagues, c'est des ondes sonores qui naissent dans un océan binaire pour parfois s'échouer sur vos plages sonores.</p>
    <Link to="/">Retour</Link>
  </Layout>
)

export default ParVagues
