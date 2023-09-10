import * as d3 from 'd3';
import * as React from 'react';
import Caption from '../documentComponents/Caption';
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
        A paper in TMIH found “a lack of correlation between disease burden,
        research output and government funding for priority NTDs in
        Brazil”(Fonseca 1373)
        <br></br>
        <br></br>
        In Brazil, funding for research into neglected tropical diseases is
        already tight, so the financial burden of journal subscriptions is
        especially harmful.
      </CountryDescription>
      <CountryDescription
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        id="Peru"
      >
        "Having to pay US$1,000 per year to HINARI has left many public
        universities in the provinces of Peru without access because they cannot
        afford it"(Villafuerte-Gálvez 1134)
        <br></br>
        <br></br>
        Even with aid, many universities and research institutions in developing
        countries cannot afford subscriptions to journals.
      </CountryDescription>
      <CountryDescription
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        id="Liberia"
      >
        <p>
          "the Ebola virus outbreak in Liberia in 1982 remained hidden to some
          public health institutions because the paper reporting this
          information was published in a subscription-only journal"(Capocasa)
          <br></br>
          <br></br>
          Lack of access to research can lead to disaster in the worst cases.
        </p>
      </CountryDescription>
      <a href = "https://simplemaps.com/resources/svg-world"><Caption>From simplemaps.com</Caption></a>
    </div>
  );
}
