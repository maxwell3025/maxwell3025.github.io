import * as React from 'react';
import Caption from '../documentComponents/Caption';
import DocDiv from '../documentComponents/DocDiv';
import Gavel from './gavel.svg';

export default function Infographic() {
  return (
    <DocDiv>
      <svg
        className="float-left clear-right h-24"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="fill-slate-200" cx={50} cy={50} r={50}></circle>
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-lg"
          x={50}
          y={50}
        >
          2011
        </text>
      </svg>
      <div className="clear-right">
        Sci-Hub was founded in 2011 by Alexandra Elbalyalkan
      </div>
      <svg
        className="float-right clear-left h-24"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle className="fill-slate-200" cx={50} cy={50} r={50}></circle>
        <text textAnchor="middle" dominantBaseline="middle" x={50} y={50}>
          51M
        </text>
      </svg>
      <div className="clear-left">
        Sci-Hub currently hosts 51 million journal articles
      </div>
      <a href="https://freesvg.org/gavel-outline">
        <svg
          className="float-left clear-right h-24"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className="fill-slate-200" cx={50} cy={50} r={50}></circle>
          <Gavel width="100" height="100"></Gavel>
        </svg>
      </a>
      <div className="clear-right">
        Since Sci-Hub is in violation of copyright law, it has faced numerous
        legal troubles in the past
      </div>
      <a href="https://freesvg.org/gavel-outline">
        <div className="clear-left">
          <Caption>From freesvg.org</Caption>
        </div>
      </a>
    </DocDiv>
  );
}
