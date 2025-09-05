import { useState } from "react";
// Import the new file upload component
import { FileUpload } from "./components/FileUpload";

// Keep the MUI components for the report section
import { Alert, Paper, Chip, List, ListItem, Stack, Typography, Box, TextField, Button, CircularProgress } from "@mui/material";

export default function UploadResume() {
  const [file, setFile] = useState(null); // This will hold our single file
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // This function now receives an array of files from the new component
  const handleFileChange = (newFiles) => {
    if (newFiles && newFiles.length > 0) {
      // We only care about the first file for our app
      setFile(newFiles[0]);
    }
  };

  const handleAnalyse = async () => {
    if (!file || !jobDescription) {
      setError("Please upload a resume and paste a job description.");
      return;
    }
    // ... (The rest of the analysis logic is exactly the same)
    setIsLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const uploadRes = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Failed to parse the resume PDF.");
      const { text: resumeText } = await uploadRes.json();
      const analyseRes = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, JobDescription: jobDescription }),
      });
      if (!analyseRes.ok) {
        const errorData = await analyseRes.json();
        throw new Error(errorData.error || "Failed to get analysis from the AI model.");
      }
      const analysisData = await analyseRes.json();
      setAnalysis(analysisData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Using a div with Tailwind classes for background color
    <div className="bg-gray-50 dark:bg-neutral-900 min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4f46e5', '.dark &': { color: 'white' } }}>
          AI Resume Analyzer
        </Typography>

        {/* The new Aceternity UI component */}
        <FileUpload onChange={handleFileChange} />

        {/* We can still use MUI components alongside Tailwind */}
        <TextField
          label="Paste Job Description Here"
          multiline
          rows={10}
          variant="outlined"
          fullWidth
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          sx={{
            mt: 4,
            '& .MuiInputBase-input': {
              color: '#FFFFFF', // Dark slate text for light mode
              '.dark &': {
                color: '#cbd5e1', // Lighter slate text for dark mode
              },
            }
          }}
        />

        <Box sx={{ position: 'relative', mt: 4 }}>
          <Button variant="contained" fullWidth size="large" disabled={isLoading} onClick={handleAnalyse}>
            Analyse Resume
          </Button>
          {isLoading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {analysis && (
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>Analysis Report</Typography>
            <Typography variant="h6">ATS Score: {analysis.atsScore} / 100</Typography>
            <Box sx={{ mt: 2 }}><Typography variant="subtitle1" gutterBottom>Matching Keywords:</Typography><Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">{analysis.matchingKeywords.map((kw, i) => <Chip key={i} label={kw} color="success" />)}</Stack></Box>
            <Box sx={{ mt: 2 }}><Typography variant="subtitle1" gutterBottom>Missing Keywords:</Typography><Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">{analysis.missingKeywords.map((kw, i) => <Chip key={i} label={kw} color="error" />)}</Stack></Box>
            <Box sx={{ mt: 2 }}><Typography variant="subtitle1" gutterBottom>Suggestions for Improvement:</Typography><List sx={{ listStyleType: 'decimal', pl: 4 }}>{analysis.suggestions.map((sugg, i) => <ListItem key={i} sx={{ display: 'list-item' }}>{sugg}</ListItem>)}</List></Box>
          </Paper>
        )}
      </div>
    </div>
  );
}