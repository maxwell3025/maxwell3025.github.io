import * as d3 from 'd3';
import * as React from 'react';
import H2 from '../documentComponents/H2';
import pubData from './pubData';

function getRadius(year: number, index: number) {
  let i = year - 1973;
  let size = pubData[i][index] * 100; //full is 10000 bcs 100x100
  return Math.sqrt(size / Math.PI);
}

export default function Graph3() {
  const [year, setYear] = React.useState(1973);
  React.useEffect(() => {
    setTimeout(() => {
      if (year != 2013) {
        setYear(year + 1);
      } else {
        setYear(1973);
      }
    }, 500);
  });

  const currentData = pubData[year - 1973];

  let colors = [];
  for (let i = 0; i < 7; i++) {
    colors.push(Math.random().toString(16).slice(-6));
  }
  const titles = [
    'Independents',
    'American Chemical Society',
    'Wiley Blackwell',
    'Taylor & Francis',
    'SpringerLink',
    'Reed-Elsevier',
  ];
  let currentHeight = 100;
  let boxes = [];
  currentData.slice(1).forEach((elem, index) => {
    currentHeight -= elem;
    boxes.push(
      <rect
        key={index}
        x={0}
        y={currentHeight}
        width={100}
        height={elem}
        className="transition delay-500"
        style={{ fill: `#${colors[index]}` }}
      ></rect>,
      <text key={`title${index}`} x={0} y={0} transform={`translate(${50} ${currentHeight + elem/2}) scale(0.5 0.5)`} textAnchor="middle" dominantBaseline="middle">
        {titles[index]}
      </text>
    );
  });

  return (
    <div className="">
      <H2>Year: {year}</H2>
      <svg
        className="h-96 w-96"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {boxes}
      </svg>
    </div>
  );
}
