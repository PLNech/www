/* Lightweight mock for react-force-graph-2d to keep unit tests fast and DOM-based.
   Uses forwardRef to silence ref warnings from the real component usage. */
import React, { forwardRef } from 'react';

const ForceGraph2D = forwardRef(function ForceGraph2D(props, ref) {
  const { graphData } = props || {};
  const nodeCount = (graphData && graphData.nodes && graphData.nodes.length) || 0;
  const linkCount = (graphData && graphData.links && graphData.links.length) || 0;
  return (
    <div
      ref={ref}
      data-testid="force-graph-2d-mock"
      data-nodes={nodeCount}
      data-links={linkCount}
      style={{ border: '1px dashed #ccc', padding: 8 }}
    >
      ForceGraph2D mock — {nodeCount} nodes / {linkCount} links
      {/* Expose buttons to simulate callbacks if needed */}
      <button
        type="button"
        data-testid="mock-center"
        onClick={() => {
          if (typeof props.onNodeClick === 'function' && graphData?.nodes?.length) {
            props.onNodeClick(graphData.nodes[0]);
          }
        }}
      >
        mock-center-first
      </button>
    </div>
  );
});

export default ForceGraph2D;
