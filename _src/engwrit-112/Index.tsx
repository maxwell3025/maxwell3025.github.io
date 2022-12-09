import * as React from 'react';
import Citation from './documentComponents/Citation';
import H1 from './documentComponents/H1';
import H2 from './documentComponents/H2';
import Link from './documentComponents/Link';
import Paragraph from './documentComponents/Paragraph';
import Dropdown from './documentComponents/Dropdown';

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-amber-800 text-amber-50">
      <H1>The Importance of SciHub, Explained in 3 Graphs</H1>
      <H2>What Is Sci-Hub?</H2>
      <Paragraph first>Testing Testing</Paragraph>
      <Citation>
        Hello world!<br></br>
        Hello world!<br></br>
        the source is <Link href=".">This</Link>
      </Citation>
      <Dropdown title="THIS IS A TEST">
        <div className="h-96 w-96 bg-white">HELLO</div>
      </Dropdown>
    </div>
  );
}
