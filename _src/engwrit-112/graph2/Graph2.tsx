import * as d3 from 'd3';
import * as React from 'react';
import CountryDescription from './CountryDescription';
import World from './world.svg';

export default function Graph2() {
  const [selectedCountry, setSelectedCountry] = React.useState<string>(null);
  const svgID = React.useId();
  React.useEffect(() => {
    const svgNode = document.getElementById(svgID);
    svgNode.childNodes.forEach(childNode => {
      childNode;
    });
    const graphicBrazil = d3.selectAll('#BR');
    graphicBrazil
      .style('fill', 'red')
      .on('click', () => setSelectedCountry('Brazil'));
    const graphicPeru = d3.selectAll('#PE');
    graphicPeru
      .style('fill', 'red')
      .on('click', () => setSelectedCountry('Peru'));
    const graphicLiberia = d3.selectAll('#LR');
    graphicLiberia
      .style('fill', 'red')
      .on('click', () => setSelectedCountry('Liberia'));
  });
  return (
    <div className="relative w-full">
      <World
        id={svgID}
        width="100%"
        height="auto"
        preserveAspectRatio="xMidYMid meet"
      ></World>
      <CountryDescription
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        id="Brazil"
      >
        “a lack of correlation between disease burden, research output and
        government funding for priority NTDs in Brazil”(Fonseca 1373)
      </CountryDescription>
      <CountryDescription
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        id="Peru"
      >
        "Having to pay US$1,000 per year to HINARI has left many public
        universities in the provinces of Peru without access because they cannot
        afford it"(Villafuerte-Gálvez 1134)
      </CountryDescription>
      <CountryDescription
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        id="Liberia"
      >
        <p>
          In 1982, an Ebola outbreak was left hidden to public heapth officials
          due to the information being published in a subscription-only
          journal(Capocasa)
        </p>
      </CountryDescription>
    </div>
  );
}
