import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Fade,
  Paper
} from '@mui/material';
import { 
  Volume2, 
  Mic, 
  User, 
  Sparkles, 
  Play, 
  MessageSquare 
} from 'lucide-react';

// Persona configuration for UI mapping
const PERSONAS = [
  { id: 'Polite', label: 'Polite', color: 'text-blue-500', desc: 'Gentle & courteous' },
  { id: 'Sarcastic', label: 'Sarcastic', color: 'text-orange-500', desc: 'Witty & biting' },
  { id: 'Professional', label: 'Professional', color: 'text-purple-500', desc: 'Clear & formal' },
];

function App() {
  const [keywords, setKeywords] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [persona, setPersona] = useState("Polite");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

const handleSpeak = async () => {
  if (!keywords.trim()) {
    setError("Please enter some keywords first.");
    return;
  }

  setIsLoading(true);
  setGeneratedText("");

  try {
    const response = await fetch("http://127.0.0.1:8000/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords, persona }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Read audio ONLY once
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();

    // Read generated text from header
    const generated = response.headers.get("X-Generated-Text");
    if (generated) {
      setGeneratedText(generated);
    }

  } catch (err) {
    console.error("Error generating speech:", err);
    setError("Failed to connect to backend.");
  } finally {
    setIsLoading(false);
  }
};


  const activePersona = PERSONAS.find(p => p.id === persona);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      
      {/* Main Container Card */}
      <Card 
        className="w-full max-w-md relative overflow-visible"
        sx={{ 
          borderRadius: 4, 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header Section */}
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <Typography variant="h6" className="font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Voice Gen
            </Typography>
            <Typography variant="caption" className="text-slate-500">
              Text-to-Speech Engine
            </Typography>
          </div>
          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <CardContent className="space-y-6 p-6">
          
          {/* Display Box / Screen */}
          <Paper 
            elevation={0} 
            className={`
              min-h-[120px] p-4 rounded-xl border transition-all duration-300 flex flex-col justify-center items-center text-center
              ${generatedText 
                ? 'bg-indigo-50 border-indigo-100' 
                : 'bg-slate-50 border-slate-200 border-dashed'}
            `}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <CircularProgress size={24} thickness={4} sx={{ color: '#6366f1' }} />
                <Typography variant="caption" className="text-slate-400 animate-pulse">
                  Generating audio...
                </Typography>
              </div>
            ) : generatedText ? (
              <Fade in={true}>
                <div>
                  <div className="mb-2 flex justify-center">
                     <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white shadow-sm border ${activePersona?.color.replace('text', 'border')}`}>
                       {persona} Mode
                     </span>
                  </div>
                  <Typography variant="body1" className="text-slate-700 font-medium leading-relaxed">
                    "{keywords}"
                  </Typography>
                </div>
              </Fade>
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 opacity-20" />
                <Typography variant="body2">
                  Your generated speech text will appear here.
                </Typography>
              </div>
            )}
          </Paper>

          {/* Controls Section */}
          <div className="space-y-4">
            
            {/* Input Field */}
            <TextField
              fullWidth
              label="Keywords or Phrase"
              variant="outlined"
              placeholder="e.g. Hello world, how are you?"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isLoading}
              InputProps={{
                startAdornment: <Mic className="w-4 h-4 text-slate-400 mr-2" />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#fff'
                }
              }}
            />

            {/* Persona Selector */}
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel id="persona-label">Voice Persona</InputLabel>
              <Select
                labelId="persona-label"
                value={persona}
                label="Voice Persona"
                onChange={(e) => setPersona(e.target.value)}
                disabled={isLoading}
                startAdornment={<User className="w-4 h-4 text-slate-400 mr-2 ml-1" />}
                sx={{ borderRadius: 3, backgroundColor: '#fff' }}
              >
                {PERSONAS.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">{p.label}</span>
                      <span className="text-xs text-slate-400">{p.desc}</span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Action Button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSpeak}
              disabled={isLoading || !keywords}
              startIcon={!isLoading && <Play className="w-5 h-5" />}
              sx={{
                mt:2,
                borderRadius: 3,
                height: 56,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 10px 20px -10px rgba(79, 70, 229, 0.5)',
                background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4338ca 30%, #6d28d9 90%)',
                }
              }}
            >
              {isLoading ? 'Processing...' : 'Generate & Speak'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Notification */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%', borderRadius: 2 }}>
          {error}
        </Alert>
      </Snackbar>

    </div>
  );
}

export default App;