import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import CircuitEditor from "./CircuitEditor";

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(React.createElement(CircuitEditor, {initialWidth: 3}))