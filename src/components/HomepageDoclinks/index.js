import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import styles from './styles.module.css'

const FeatureList = [
  {
    title: 'API Reference',
    Svg: require('@site/static/img/http.svg').default,
    description: <>View the complete HTTP API reference.</>,
    href: 'https://docs.bsky.app/docs/category/http-reference',
  },
  {
    title: 'Tutorials',
    Svg: require('@site/static/img/tutorial.svg').default,
    description: <>View tutorials for handling the Bluesky API.</>,
    href: '/docs/category/tutorials',
  },
  {
    title: 'Starter Templates',
    Svg: require('@site/static/img/template.svg').default,
    description: <>View starter code for bots, custom feeds, and clients.</>,
    href: '/docs/category/starter-templates',
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
