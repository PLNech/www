import Image from 'next/image'
import Link from 'next/link'

export async function getStaticProps(context) {
  return {
    props: {}
  }
}

export default function Hydra() { return (
  <div>
    <h1>Image Component With Layout Responsive</h1>
    <Image
      alt="Mountains"
      src="/images/WIP_GaLactic.png"
      layout="fill"
      // width={700}
      // height={475}
    />
  <Link href="/">Back</Link>
  </div>
)
}
