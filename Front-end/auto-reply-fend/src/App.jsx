import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Container, Typography } from '@mui/material';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone , setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
      <Container maxWidth="md" sx={{py:4}}>
        <Typography variant='h4' component='h1' gutterBottom>
          Auto Reply Generator
        </Typography>
      </Container>
  )
}

export default App
