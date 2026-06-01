import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './styles.module.css'

// The HTTP API reference is now a standalone site. Its card links to
// `endpointsUrl` (the ENDPOINTS_URL env var) and is only shown when that is set,
// so no domain is hardcoded while hosting is still being decided.
const apiReferenceCard = (endpointsUrl) => ({
  title: 'API Reference',
  Svg: require('@site/static/img/http.svg').default,
  description: <>View the complete HTTP API reference.</>,
  href: endpointsUrl,
})

const FeatureList = [
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
  const { siteConfig } = useDocusaurusContext()
  const endpointsUrl = siteConfig.customFields?.endpointsUrl
  const features = endpointsUrl
    ? [apiReferenceCard(endpointsUrl), ...FeatureList]
    : FeatureList

  return (
    <section className={styles.doclinks}>
      <h2 className={clsx('text--center text--lg', styles.heading)}>
        Read the docs
      </h2>
      <div className={styles.doclinksWrapper}>
        {features.map((props, idx) => (
          <Doclink key={idx} {...props} />
        ))}
      </div>
    </section>
  )
}
