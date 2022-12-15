import * as React from 'react';
import Citation from './documentComponents/Citation';
import H1 from './documentComponents/H1';
import H2 from './documentComponents/H2';
import Link from './documentComponents/Link';
import Paragraph from './documentComponents/Paragraph';
import Dropdown from './documentComponents/Dropdown';
import Caption from './documentComponents/Caption';
import Graph1 from './graph1/Graph1';
import DocDiv from './documentComponents/DocDiv';
import Infographic from './infographic/Infographic';
import Graph2 from './graph2/Graph2';
import Graph3 from './graph3/Graph3';

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-amber-800 text-amber-50">
      <H1>The Importance of SciHub, Explained in 3 Graphs</H1>
      <H2>*Insert hook*</H2>
      <img
        alt="Sci-Hub logo"
        src="https://sci-hub.se/pictures/ravenround_hs.gif"
      ></img>
      <Caption>Alexandra Elbalyalkan/Sci-Hub</Caption>
      <Paragraph first>
        Academic research is essential to the functioning of our modern society
        in a way that is hard to overstate. As such, access to academic
        resources like books, papers, and documents is also essential.
      </Paragraph>
      <Paragraph>
        Unfortunately, many of these resources are hidden behind paywalls,
        making it hard for researchers outside of well-funded institutions to
        access these resources. While there are many organizations that try to
        remedy this, one of the largest is Sci-Hub.
      </Paragraph>

      <Infographic />

      <Paragraph>
        In order to understand Where Sci-Hub fits in, it is first important to
        understand how scientific publishing works.
      </Paragraph>

      <Graph1 />

      <Paragraph first>
        Researchers in developing countries especially benefit from Sci-Hub
        because without it, up-to-date scientific knowledge would be
        inaccessible to them. Lets look at a few examples to see the
        implications of this
      </Paragraph>
      <H2></H2>

      <Graph2 />

      <Paragraph>
        As a solution, some people have prosposed solutions related to
        open-access, but this does not fully solve the problem. For one, not
        every article is open access, so many articles – some of which might be
        needed in order to research a particular topic – remain inaccessible to
        researchers in developing countries.
      </Paragraph>
      <Paragraph>
        An article on this phenomenon found that smaller, open-access publishers
        often face financial instability due to “the pressures of market
        consolidation, which impede smaller society publishers from competing on
        a level playing field.”(Matthias 22).
      </Paragraph>
      <Graph3 />
      <Paragraph first>
        As can be seen in the above graphic, this problem has only gotten worse
        in recent years.
      </Paragraph>
      <Dropdown title="Bibliography">
        <Citation>
          Buehling, Kilian, et al. “Free Access to Scientific Literature and Its
          Influence on the Publishing Activity in Developing Countries: The
          Effect of Sci‐Hub in the Field of Mathematics.” Journal of the
          Association for Information Science & Technology, vol. 73, no. 9,
          Sept. 2022, pp. 1336–55. EBSCOhost, https://doi.org/10.1002/asi.24636.
        </Citation>
        <Citation>
          Capocasa, Marco, et al. “A light in the dark: open access to medical
          literature and the COVID-19 pandemic.” INFORMATION RESEARCH-AN
          INTERNATIONAL ELECTRONIC JOURNAL, vol. 27, no. 2, June 2022.
          https://doi.org/10.47989/irpaper929.
        </Citation>
        <Citation>
          Fonseca, Bruna de Paula, et al. “Neglected tropical diseases in
          Brazil: lack of correlation between disease burden, research funding
          and output.” Tropical Medicine & International Health, vol. 25, no. 11
          November 2020, https://doi.org/10.1111/tmi.13478.
        </Citation>
        <Citation>
          Matthias, Lisa, et al. “The Two-Way Street of Open Access Journal
          Publishing: Flip It and Reverse It” Publications, vol. 7, no. 2, 3
          April 2019, https://doi.org/10.3390/publications7020023
        </Citation>
        <Citation>
          Schultz, David M. “The Process of Publishing Scientific Papers.”
          Eloquent Science: A Practical Guide to Becoming a Better Writer,
          Speaker, and Atmospheric Scientist, American Meteorological Society,
          2009, Boston, MA. https://doi.org/10.1007/978-1-935704-03-4_1.
        </Citation>
        <Citation>
          Villafuerte-Gálvez, Javier, et al. “Biomedical Journals and Global
          Poverty: Is HINARI a Step Backwards?” Public Library of Science, June
          2007, vol. 4, no. 6, https://doi.org/10.1371/journal.pmed.0040220,
        </Citation>
      </Dropdown>
    </div>
  );
}
