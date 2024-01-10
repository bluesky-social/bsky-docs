import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import styles from './styles.module.css'

const FeatureList = [
  {
    title: 'Client Apps',
    description: <>Build a client for the Bluesky app.</>,
    href: '/docs/starter-templates/clients',
  },
  {
    title: 'Custom Feeds',
    description: <>Build an algorithm to drive users' feeds.</>,
    href: '/docs/starter-templates/feed-generator',
  },
  {
    title: 'Bots',
    description: <>Build a bot with custom behaviors.</>,
    href: '/docs/starter-templates/bots',
  },
]

function Starter({ href, title, description }) {
  return (
    <Link
      className={clsx('text--center white padding-horiz--md', styles.starter)}
      to={href}
    >
      <span className={styles.title}>{title}</span>
      <span className={styles.description}>{description}</span>
      <span className={styles.slug}>Starter Template</span>
    </Link>
  )
}

export default function HomepageStarters() {
  return (
    <section className={styles.startersContainer}>
      <div className={styles.starters}>
        {FeatureList.map((props, idx) => (
          <Starter key={idx} {...props} />
        ))}
      </div>
    </section>
  )
}
