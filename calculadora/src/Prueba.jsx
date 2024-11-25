import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

const Graph = () => {
  const elements = [
    { data: { id: '1', label: 'Node 1' }, position: { x: 100, y: 100 } },
    { data: { id: '2', label: 'Node 2' }, position: { x: 200, y: 200 } },
    { data: { source: '1', target: '2' } },
  ];

  return (
    <CytoscapeComponent
      elements={elements}
      style={{ width: '600px', height: '400px' }}
    />
  );
};

export default Graph;
