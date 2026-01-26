import { useState } from "react";
import { FileUpload } from "./components/FileUpload"; 
import { cn } from "./lib/utils";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyse = async () => {
    if (!file || !jobDescription) return setError("Please provide both a resume and job description.");
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      
      const uploadRes = await fetch("http://localhost:5000/upload", { method: "POST", body: formData });
      const { text: resumeText } = await uploadRes.json();

      const analyseRes = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, JobDescription: jobDescription }),
      });

      const data = await analyseRes.json();
      setAnalysis(data);
    } catch (err) {
      setError("Something went wrong. Check your API key or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter">RESUME <span className="text-sky-500">ANALYSER</span></h1>
          <p className="text-neutral-500">AI-powered optimization for your next application</p>
        </header>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-2 shadow-2xl">
          <FileUpload onChange={(f) => setFile(f)} />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Job Description</label>
          <textarea
            rows="6"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-5 text-neutral-200 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job requirements here..."
          />
        </div>

        <button onClick={handleAnalyse} disabled={isLoading} className={cn(
          "w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-lg",
          isLoading ? "bg-neutral-800 text-neutral-600" : "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/20"
        )}>
          {isLoading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {analysis && (
          <div className="mt-12 p-8 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-neutral-400 font-bold uppercase text-xs">ATS Match Rate</span>
                <span className="text-4xl font-black text-sky-400">{analysis.atsScore}%</span>
              </div>
              <div className="w-full bg-neutral-800 h-3 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full transition-all duration-1000" style={{ width: `${analysis.atsScore}%` }} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <KeywordBox title="Matching Skills" items={analysis.matchingKeywords} color="text-emerald-400" bg="bg-emerald-500/10" />
              <KeywordBox title="Missing Skills" items={analysis.missingKeywords} color="text-orange-400" bg="bg-orange-500/10" />
            </div>

            <div className="pt-6 border-t border-neutral-800">
              <h3 className="text-sky-400 font-bold mb-4">Improvement Plan</h3>
              <ul className="space-y-3">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-neutral-400 text-sm flex gap-3"><span className="text-sky-500 font-bold">{i+1}.</span> {s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KeywordBox({ title, items, color, bg }) {
  return (
    <div className="space-y-3">
      <h4 className={cn("text-sm font-bold uppercase tracking-wider", color)}>{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={cn("px-3 py-1 rounded-lg text-xs border border-white/5", bg, color)}>{item}</span>
        ))}
      </div>
    </div>
  );
}