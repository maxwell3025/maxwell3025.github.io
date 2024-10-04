import * as React from 'react';
import CircuitEditor from './CircuitEditor';

export default function Index() {
  return (
    <div className="absolute inset-0 bg-black text-white">
      <a href="..">
        <h1 className="text-center text-3xl">Maxwell3025's Website</h1>
      </a>
      <CircuitEditor initialWidth={2} initialColumnCount={4}></CircuitEditor>
    </div>
  );
}
