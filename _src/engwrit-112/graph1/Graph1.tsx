import * as React from 'react';
import Line from './Line';
import Node from './Node';

export default function Graph1() {
  const [activeNode, setActiveNode] = React.useState<string>(null);

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="1"
          markerHeight="2"
          refX="0"
          refY="1"
          orient="auto"
        >
          <polygon points="0 0, 1 1, 0 2" />
        </marker>
      </defs>
      <Node
        x={50}
        y={10}
        setActiveNode={setActiveNode}
        activeNode={activeNode}
        title="Completed Paper"
      >
        You've done the research, everthing is properly formatted and proofread,
        and now you have a paper ready to submit to the journal of your choice!.
      </Node>
      <Line x1={50} y1={15} x2={50} y2={24}></Line>
      <Node
        x={50}
        y={30}
        setActiveNode={setActiveNode}
        activeNode={activeNode}
        title="Review"
      >
        Once your paper is sent to publishers, it is reviewed and is either
        rejected, sent back to be modified, or accepted as-is
      </Node>
      <Line x1={50} y1={35} x2={10} y2={44}></Line>
      <Line x1={50} y1={35} x2={50} y2={44}></Line>
      <Line x1={50} y1={35} x2={90} y2={44}></Line>
      <Node
        x={10}
        y={50}
        setActiveNode={setActiveNode}
        activeNode={activeNode}
        title="Rejection"
      >
        So your paper was rejected! Bummer. Maybe it you didn't show enough
        effort revising. Maybe a crucial flaw in your paper came up, or maybe it
        didn't match of goal of the journal. In any case, better luck next time!
      </Node>
      <Node
        x={50}
        y={50}
        setActiveNode={setActiveNode}
        activeNode={activeNode}
        title="Revision"
      >
        Most papers are sent back with suggested edits. Although your paper was
        already well polished, it still needs to be improved to line up with the
        standards of the journal you submitted to.
      </Node>
      <Line x1={53} y1={45} x2={53} y2={35}></Line>
      <Node
        x={90}
        y={50}
        setActiveNode={setActiveNode}
        activeNode={activeNode}
        title="Accepted"
      >
        If this is your first time around, then great! Most papers have to be
        edited before they are accepted, and now it's time for publishing.
      </Node>
      <Line x1={90} y1={55} x2={40} y2={65}></Line>
      <Line x1={90} y1={55} x2={60} y2={65}></Line>
      <Node
        x={40}
        y={70}
        setActiveNode={setActiveNode}
        activeNode={activeNode}
        title="Subscription"
      >
        Libraries and universities often have subscriptions to journals.
      </Node>
      <Line x1={40} y1={75} x2={50} y2={85}></Line>
      <Node
        x={60}
        y={70}
        setActiveNode={setActiveNode}
        activeNode={activeNode}
        title="Pay-Per-View"
      >
        For access to individual articles, people who don't have subscriptions
        can have a pay to get access to specific articles, with prices being in
        the range of $30 per article.
      </Node>
      <Line x1={60} y1={75} x2={50} y2={85}></Line>
      <Node
        x={50}
        y={90}
        setActiveNode={setActiveNode}
        activeNode={activeNode}
        title="Sci-Hub"
      >
        Sci-Hub gives access to articles for free, and these are typically
        eneterd into Sci-Hub's database through "donated" copies of articles.
      </Node>
    </svg>
  );
}
