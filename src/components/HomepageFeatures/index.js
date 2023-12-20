import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Federated Social',
    Svg: require('@site/static/img/at-sign.svg').default,
    description: (
      <>
        Connect with anyone on any service that's using the AT Protocol.
      </>
    ),
  },
  {
    title: 'Algorithmic Choice',
    Svg: require('@site/static/img/light.svg').default,
    description: (
      <>
        Control how you see the world through an open market of algorithms.
      </>
    ),
  },
  {
    title: 'Portable Accounts',
    Svg: require('@site/static/img/suitcase.svg').default,
    description: (
      <>
        Change hosts without losing your content, your follows, or your identity.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
