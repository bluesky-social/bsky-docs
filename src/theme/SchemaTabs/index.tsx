import React from 'react';
import OriginalSchemaTabs from '@theme-original/SchemaTabs';

export default function SchemaTabs(props) {
  const children = React.Children.toArray(props.children);

  if (children.length === 0) {
    return null;
  }

  return <OriginalSchemaTabs {...props} />;
}