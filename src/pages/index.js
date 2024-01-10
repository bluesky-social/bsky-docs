import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageStarters from '@site/src/components/HomepageStarters'
import HomepageSDKs from '@site/src/components/HomepageSDKs'
import HomepageDoclinks from '@site/src/components/HomepageDoclinks'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
const Logo = require('@site/static/img/logo.svg').default

import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <Logo className={styles.heroImage} role="image" />
        <h1 className={clsx('hero__title', styles.heroText)}>
          Bluesky Developer APIs
        </h1>
        <p className={clsx('hero__subtitle', styles.heroText)}>
          Build apps, bots, and feed generators on Bluesky's open social network.
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button', styles.heroButton)}
            to="/docs/get-started"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title="Bluesky Documentation"
      description="Explore guides and tutorials to the Bluesky API."
    >
      <HomepageHeader />
      <main>
        <HomepageStarters />
        <div className={styles.twoCol}>
          <HomepageSDKs />
          <HomepageDoclinks />
        </div>
      </main>
    </Layout>
  )
}
