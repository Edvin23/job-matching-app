import React, { useState, useRef } from 'react';
import './ResumeAI.css';
import { auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons';

const ResumeAI = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobMatches, setJobMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setJobMatches([]);

    // Check file type (only allow PDF)
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setLoading(false);
      return;
    }

    try {
      // Read the file content
      const text = await file.text();
      setResumeText(text);
      
      // Call the analyze_resume Cloud Function
      const analyzeResume = httpsCallable(functions, 'analyze_resume');
      const result = await analyzeResume({ resumeText: text });
      
      // Update state with job matches
      setJobMatches(result.data.matches || []);
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="resume-ai-container">
      <h2 className="resume-ai-title">Resume AI Job Matcher</h2>
      
      <div className="resume-upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          style={{ display: 'none' }}
        />
        <button 
          onClick={handleUploadClick}
          disabled={loading}
          className="resume-upload-button"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Analyzing...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUpload} /> Upload Resume (PDF)
            </>
          )}
        </button>
        
        {error && <p className="resume-error">{error}</p>}
      </div>
      
      {jobMatches.length > 0 && (
        <div className="job-matches-section">
          <h3>Job Matches</h3>
          <div className="job-matches-grid">
            {jobMatches.map((match, index) => (
              <div key={index} className="job-match-card">
                <div className="job-match-header">
                  <h4>{match.title}</h4>
                  <div className="match-score">
                    <span className="match-percentage">{match.matchPercentage}%</span>
                    <span className="match-label">Match</span>
                  </div>
                </div>
                <p className="job-description">{match.description}</p>
                <div className="matching-skills">
                  <h5>Matching Skills:</h5>
                  <div className="skills-list">
                    {match.matchingSkills && match.matchingSkills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
                <button className="apply-button">Apply Now</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAI;