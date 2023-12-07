import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const socket = io('http://localhost:3001'); // Initialize socket connection to server.

const CodeBlock = () => {
  const { title } = useParams();
  const [code, setCode] = useState('');
  const [role, setRole] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    socket.emit('join', title);

    socket.on('code', setCode);
    socket.on('codeUpdate', setCode);
    socket.on('setRole', setRole);

    // Clean up event listeners when component unmounts
    return () => {
      socket.off('code');
      socket.off('codeUpdate');
      socket.off('setRole');
    };
  }, [title]);

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [code, role]);

  useEffect(() => {
    window.addEventListener('resize', resizeTextarea);              //resize the textarea when the window resizes.
    return () => {
      window.removeEventListener('resize', resizeTextarea);
    };
  }, []);

  const handleCodeChange = (event) => {
    const updatedCode = event.target.value;
    setCode(updatedCode);
    
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
              color: 'rgba(0, 0, 0, 0)',
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
        )}
        <SyntaxHighlighter                      //display styled syntax.
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
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;