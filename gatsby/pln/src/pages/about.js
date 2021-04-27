import React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"

export default function About() {
  return (
    <Layout>
      <Seo title="About this site" />
      <div>
        <h1>About this site</h1>
        <h2>Built with Gatsby</h2>
        <p>Such wow. Very React.</p>
      </div>
      </Layout>
  )
}
