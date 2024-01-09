import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import styles from './styles.module.css'

const FeatureList = [
  {
    title: 'HTTP reference',
    Svg: require('@site/static/img/http.svg').default,
    description: <>View the complete HTTP API reference.</>,
    href: '/docs/category/bluesky-api',
  },
]

function Doclink({ Svg, title, description, href }) {
  return (
    <Link className={styles.doclink} to={href}>
      <Svg className={styles.doclinkSvg} role="img" />
      <div className="">
        <span className={styles.doclinkTitle}>{title}</span>
        <span className={styles.doclinkDescription}>{description}</span>
      </div>
    </Link>
  )
}

export default function HomepageDoclinks() {
  return (
    <section className={styles.doclinks}>
      <h2 className={clsx('text--center text--lg', styles.heading)}>
        Read the docs
      </h2>
      <div className={styles.doclinksWrapper}>
        {FeatureList.map((props, idx) => (
          <Doclink key={idx} {...props} />
        ))}
      </div>
    </section>
  )
}
