import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');

const CodeBlock = () => {
  const { title } = useParams();
  const [role, setRole] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    socket.emit('join', title);

    socket.on('code', (newCode) => {
      if (textareaRef.current) {
        textareaRef.current.value = newCode;
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
        minHeight: '400px',         // Set a minimum height for the container
        overflow: 'auto',
      }}>
        {role === 'student' && (
          <textarea
            ref={textareaRef}
            defaultValue=""
            onChange={handleCodeChange}
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
              color: '#ffffff',
              caretColor: 'white',
              outline: 'none',
              zIndex: '1',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
            spellCheck="false"
          />
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
            }
          }}
        >
          {textareaRef.current ? textareaRef.current.value : ''}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
