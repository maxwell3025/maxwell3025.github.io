import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import CircuitEditor from "./CircuitEditor";
import 'quantumcomputer.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(React.createElement(CircuitEditor, {initialWidth: 2, initialColumnCount: 4}))