import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const IndexPage = () => (
  <Layout>
    <Seo title="PLN's Home" />
    <h1>Welcome!</h1>
    <h2>I'm PLN, and I love to <i>transform…</i></h2>

    <h3>…code into <em>human solutions</em></h3>
    <p>
      At <Link to="/algolia/">Algolia</Link>, I create technologies to help humans find things and answers.
    </p>

    <h3>…code into <em>music</em></h3>
    <p>
      As <Link to="/parvagues/">ParVagues</Link>, I write patterns that shape soundwaves.
    </p>

    <h3>…code into <em>animated pixelscapes</em></h3>
    <p>
      Using <Link to="/hydra/">Hydra</Link>, I create technologies to help humans find things and answers
    </p>.
  </Layout>
)

export default IndexPage
