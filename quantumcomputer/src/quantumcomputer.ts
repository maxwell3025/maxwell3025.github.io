import * as React from 'react';
import {createRoot} from 'react-dom/client';
import './quantumcomputer.css';
import Index from './Index';

document.body.append(document.createElement('div'));
const root = createRoot(document.querySelector('body>div'));
root.render(React.createElement(Index));
