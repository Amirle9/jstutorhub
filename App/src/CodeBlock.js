import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Connect to the server
const SERVER_URL = process.env.NODE_ENV === 'production' ? 'https://jstutorhub-production.up.railway.app/' : 'http://localhost:3001';
const socket = io(SERVER_URL);

const CodeBlock = () => {
  const { title } = useParams();
  const [code, setCode] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    socket.emit('join', title);

    // Update local state when new code is received
    socket.on('code', (newCode) => {
      setCode(newCode);
    });

    socket.on('setRole', setRole);

    // Clean up event listeners when the component unmounts
    return () => {
      socket.off('code');
      socket.off('setRole');
    };
  }, [title]);

  // Handle code changes made by the student and emit changes to the server
  const handleCodeChange = (event) => {
    const updatedCode = event.target.value;
    setCode(updatedCode); // Update local state

    if (role === 'student') {
      socket.emit('updateCode', { title, code: updatedCode });
    }
  };

  return (
    <div style={{
      fontFamily: '"Source Code Pro", monospace',
      width: '90%',
      maxWidth: 'none',
      margin: '40px auto',
      padding: '20px',
      backgroundColor: '#252526',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      color: '#ffffff',
    }}>
      <h2 style={{ borderBottom: '1px solid #007acc', paddingBottom: '10px' }}>
        Editing: {decodeURIComponent(title)}
      </h2>
      <p style={{ fontStyle: 'italic' }}>
        {role === 'mentor' ? 'Mentor View (Read-only)' : 'Welcome student'}
      </p>
      <div style={{
        position: 'relative',
        textAlign: 'left',
        backgroundColor: '#282a36',
        borderRadius: '4px',
        padding: '10px',
        minHeight: '400px',
        overflow: 'auto',
      }}>
        {role === 'student' ? (
          <textarea
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              minHeight: '200px',
              resize: 'none',
              border: 'none',
              padding: '10px',
              fontFamily: 'monospace',
              fontSize: '16px',
              lineHeight: '1.5',
              background: 'none',
              color: 'white',
              caretColor: 'white',
              outline: 'none',
              zIndex: '1',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
            value={code}
            onChange={handleCodeChange}
            spellCheck="false"
          />
        ) : (
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '16px',
              lineHeight: '1.5',
              color: 'white',
              whiteSpace: 'pre-wrap',
              padding: '10px',
            }}
          >
            {code}
          </div>
        )}
        <SyntaxHighlighter
          language="javascript"
          style={atomDark}
          customStyle={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            minHeight: '200px',
            padding: '10px',
            margin: '0',
            borderRadius: '4px',
            background: '#282a36',
            zIndex: '0',
            boxSizing: 'border-box',
          }}
          codeTagProps={{
            style: {
              lineHeight: '1.5',
              fontSize: '16px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              color: 'white',
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
