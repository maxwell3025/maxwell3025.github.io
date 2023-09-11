import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './quantumcomputer.css';
import Index from './Index';

document.body.append(document.createElement('div'));
const root = ReactDOM.createRoot(document.querySelector('body>div'));
root.render(React.createElement(Index));
