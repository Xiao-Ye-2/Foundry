import React, { useState } from "react";
import Button from "./components/Button";
import JobSearch from "./components/JobSearch";
import "./App.css";

interface Job {
  jobId: number;
  title: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  workType: string;
  cityName: string;
  companyName: string;
  isActive: boolean;
  postDate: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleGetJobs = async () => {
    try {
      setLoading(true);
      setError("");
      console.log('Fetching jobs from:', 'http://localhost:8080/api/jobs');
    
      const response = await fetch('http://localhost:8080/api/jobs', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit'  // Added this to avoid CORS credentials issues
      });
      
      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      setJobs(data);
    } catch (error) {
      console.error('Full error object:', error);
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : 'Failed to load jobs. Please check if the backend server is running.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="app-title">Job Board</h1>
        
        <div className="tab-container">
          <button 
            onClick={() => setActiveTab('simple')}
            className={`tab-button ${activeTab === 'simple' ? 'active' : ''}`}
          >
            Simple View
          </button>
          <button 
            onClick={() => setActiveTab('advanced')}
            className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          >
            Advanced Search
          </button>
        </div>
        
        {activeTab === 'simple' ? (
          <>
            <Button text={loading ? "Loading..." : "Get All Jobs"} onClick={handleGetJobs} />
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {jobs.length > 0 && (
              <div className="job-list-container">
                {jobs.map(job => (
                  <div key={job.jobId} className="job-card">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-details">
                      <p><strong>Company:</strong> {job.companyName}</p>
                      <p><strong>Location:</strong> {job.cityName}</p>
                      <p><strong>Salary Range:</strong> ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</p>
                      <p><strong>Work Type:</strong> {job.workType}</p>
                      <p><strong>Posted:</strong> {new Date(job.postDate).toLocaleDateString()}</p>
                      {job.description && (
                        <p className="job-description">{job.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <JobSearch />
        )}
      </div>
    </div>
  );
};

export default App;
