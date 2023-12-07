// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import CodeBlock from './CodeBlock';
import './App.css';

function App() {
  const codeBlocks = ['Async Case', 'Data Structures and Algorithms', 'Design Patterns', 'Others'];

  return (
    <Router>
      <div className="App">
        <h1>Choose Code Block</h1>
        <ul>
          {codeBlocks.map((block, index) => (
            <li key={index}>
              <Link to={`/codeblock/${encodeURIComponent(block)}`}>{block}</Link>
            </li>
          ))}
        </ul>
        <Routes>
          <Route path="/" element={<div>Welcome to the Code Editor! Select a code block above.</div>} />
          <Route path="/codeblock/:title" element={<CodeBlock />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
