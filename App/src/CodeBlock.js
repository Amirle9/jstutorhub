// CodeBlock.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Ensure this path is correct

const socket = io('http://localhost:3001');

const CodeBlock = () => {
  const { title } = useParams();
  const [code, setCode] = useState('');
  const [role, setRole] = useState('');
  const codeRef = useRef(null);

  useEffect(() => {
    socket.emit('join', title);

    socket.on('code', (newCode) => {
      setCode(newCode);
    });

    socket.on('codeUpdate', (newCode) => {
      setCode(newCode);
    });

    socket.on('setRole', (newRole) => {
      setRole(newRole);
    });

    return () => {
      socket.off('code');
      socket.off('codeUpdate');
      socket.off('setRole');
    };
  }, [title]);

  useEffect(() => {
    if (codeRef.current) {
      // Remove the highlighted attribute before applying highlighting again
      codeRef.current.removeAttribute('data-highlighted');
      codeRef.current.textContent = code; // Set innerHTML to the code content
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCodeChange = (event) => {
    const updatedCode = event.target.value;
    setCode(updatedCode);
    if (role === 'student') {
      socket.emit('updateCode', { title, code: updatedCode });
    }
  };

  return (
    <div>
      <h2>Editing: {decodeURIComponent(title)}</h2>
      <p>{role === 'mentor' ? 'Welcome mentor' : 'Welcome student'}</p>
      <pre style={{ textAlign: 'left', display: role === 'mentor' ? 'block' : 'none' }}>
        <code ref={codeRef} className="javascript"></code>
      </pre>
      {role === 'student' && (
        <textarea
          value={code}
          onChange={handleCodeChange}
          readOnly={role === 'mentor'}
        />
      )}
    </div>
  );
};

export default CodeBlock;