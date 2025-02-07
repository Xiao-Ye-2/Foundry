import React, { useState } from "react";
import Button from "./components/Button";

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
    <div style={{ 
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h1>Job Board</h1>
        <Button text={loading ? "Loading..." : "Get All Jobs"} onClick={handleGetJobs} />
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}
        
        {jobs.length > 0 && (
          <div style={{ width: '100%' }}>
            {jobs.map(job => (
              <div key={job.jobId} style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '20px',
                margin: '10px auto',
                width: '100%',
                maxWidth: '600px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{job.title}</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <p style={{ margin: 0 }}><strong>Company:</strong> {job.companyName}</p>
                  <p style={{ margin: 0 }}><strong>Location:</strong> {job.cityName}</p>
                  <p style={{ margin: 0 }}><strong>Salary Range:</strong> ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</p>
                  <p style={{ margin: 0 }}><strong>Work Type:</strong> {job.workType}</p>
                  <p style={{ margin: 0 }}><strong>Posted:</strong> {new Date(job.postDate).toLocaleDateString()}</p>
                  {job.description && (
                    <p style={{ margin: '10px 0 0 0' }}>{job.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
