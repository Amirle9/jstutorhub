import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');

const CodeBlock = () => {
  const { title } = useParams();
  const [code, setCode] = useState(''); // State to keep track of the code content
  const [role, setRole] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    socket.emit('join', title);

    socket.on('code', (newCode) => {
      setCode(newCode); // Update the code state when new code is received
      if (textareaRef.current && role === 'student') {
        textareaRef.current.value = newCode; // Update the textarea for the student
      }
    });
    socket.on('setRole', setRole);

    return () => {
      socket.off('code');
      socket.off('setRole');
    };
  }, [title]);

  const handleCodeChange = (event) => {
    const updatedCode = event.target.value;
    setCode(updatedCode); // Update the code state on change
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
        {role === 'student' && (
          <textarea
            ref={textareaRef}
            defaultValue={code}
            onChange={handleCodeChange}
            style={{
              // ... styles
              color: '#ffffff', // Ensure the text color is visible
            }}
            spellCheck="false"
          />
        )}
        {/* Always render SyntaxHighlighter to show highlighted code */}
        <SyntaxHighlighter
          language="javascript"
          style={atomDark}
          customStyle={{
            // ... styles
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
