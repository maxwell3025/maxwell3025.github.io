import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import Index from './Index';
import css from './style.css';

console.log(css);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(Index));
