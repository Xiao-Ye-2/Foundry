import React, { useState, useEffect } from 'react';

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
  countryName?: string;
}

interface ShortlistedJobsProps {
  employeeId: number | null;
  hasAppliedForJob: (jobId: number) => boolean;
  onApplyForJob: (jobId: number) => Promise<void>;
  applyingToJob: number | null;
  onBrowseJobs: () => void;
}

const ShortlistedJobs: React.FC<ShortlistedJobsProps> = ({
  employeeId,
  hasAppliedForJob,
  onApplyForJob,
  applyingToJob,
  onBrowseJobs
}) => {
  // States
  const [shortlistedJobs, setShortlistedJobs] = useState<Job[]>([]);
  const [loadingShortlist, setLoadingShortlist] = useState(false);
  const [shortlistError, setShortlistError] = useState<string>("");
  const [expandedShortlistJobs, setExpandedShortlistJobs] = useState<number[]>([]);

  // Fetch shortlisted jobs on component mount
  useEffect(() => {
    if (employeeId) {
      fetchShortlistedJobs();
    }
  }, [employeeId]);

  // Fetch shortlisted jobs
  const fetchShortlistedJobs = async () => {
    if (!employeeId) return;

    try {
      setLoadingShortlist(true);
      setShortlistError("");

      console.log(`Fetching shortlisted jobs for employee ID: ${employeeId}`);
      
      // This is the correct endpoint format as defined in JobController.java
      // @GetMapping("/shortlist/{employeeId}")
      const url = `http://localhost:8080/api/jobs/shortlist/${employeeId}`;
      console.log(`Request URL: ${url}`);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'omit'
        });
  
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`Failed response status: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch shortlisted jobs: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Shortlisted jobs data from API:", data);
        setShortlistedJobs(data);
      } catch (fetchError) {
        // This specific catch block will help us identify network errors vs. API errors
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          console.error('Network error - Failed to fetch. Backend might be down or unreachable.');
          throw new Error('Network error: Backend server not responding. Please check if the server is running.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error fetching shortlisted jobs:', error);
      setShortlistError(error instanceof Error ? error.message : 'Failed to load shortlisted jobs. Please try again later.');
    } finally {
      setLoadingShortlist(false);
    }
  };
  
  // Toggle shortlist job details
  const toggleJobDetails = (jobId: number) => {
    setExpandedShortlistJobs(prevIds => 
      prevIds.includes(jobId) 
        ? prevIds.filter(id => id !== jobId) 
        : [...prevIds, jobId]
    );
  };
  
  // Check if a shortlisted job is expanded
  const isJobExpanded = (jobId: number) => expandedShortlistJobs.includes(jobId);
  
  // Remove from shortlist
  const handleRemoveFromShortlist = async (jobId: number) => {
    if (!employeeId) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/jobs/shortlist?employeeId=${employeeId}&jobId=${jobId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove job from shortlist: ${response.status} ${response.statusText}`);
      }
      
      // Remove from local state
      setShortlistedJobs(prev => prev.filter(job => job.jobId !== jobId));
    } catch (error) {
      console.error('Error removing job from shortlist:', error);
      alert('Failed to remove job from shortlist');
    }
  };

  return (
    <div className="shortlist-container">
      <h2>My Shortlisted Jobs</h2>

      {loadingShortlist && <div className="loading-indicator">
        <span className="loading-icon">⏳</span> Loading your shortlisted jobs...
      </div>}

      {shortlistError && (
        <div className="error-message">
          <span className="error-icon">⚠️</span> {shortlistError}
        </div>
      )}

      {!loadingShortlist && !shortlistError && shortlistedJobs.length === 0 && (
        <div className="no-shortlist-message">
          <span className="empty-icon">📋</span>
          <p>You haven't shortlisted any jobs yet.</p>
          <button className="primary-button" onClick={onBrowseJobs}>
            Browse Jobs
          </button>
        </div>
      )}

      {!loadingShortlist && !shortlistError && shortlistedJobs.length > 0 &&
        <div className="shortlist-table-container">
          <table className="job-table">
            <thead>
              <tr>
                <th className="position-col">Position</th>
                <th className="company-col">Company</th>
                <th className="location-col">Location</th>
                <th className="salary-col">Salary</th>
                <th className="work-type-col">Type</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shortlistedJobs.map((job) => (
                <React.Fragment key={job.jobId}>
                  <tr>
                    <td className="position-col" data-label="Position">
                      <span className="job-title">{job.title}</span>
                    </td>
                    <td className="company-col" data-label="Company">
                      <span className="company-name">{job.companyName}</span>
                    </td>
                    <td className="location-col" data-label="Location">
                      {job.cityName}{job.countryName ? `, ${job.countryName}` : ''}
                    </td>
                    <td className="salary-col" data-label="Salary">
                      ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}
                    </td>
                    <td className="work-type-col" data-label="Type">
                      {job.workType}
                    </td>
                    <td className="actions-col" data-label="Actions">
                      <div className="action-buttons">
                        <button 
                          className="details-button"
                          onClick={() => toggleJobDetails(job.jobId)}
                        >
                          {isJobExpanded(job.jobId) ? 'Hide' : 'Details'}
                        </button>
                        
                        <button
                          className="remove-shortlist-button"
                          onClick={() => handleRemoveFromShortlist(job.jobId)}
                        >
                          Remove
                        </button>
                        
                        {hasAppliedForJob(job.jobId) ? (
                          <div className="applied-badge">Applied</div>
                        ) : (
                          <button 
                            className="apply-button"
                            onClick={() => onApplyForJob(job.jobId)}
                            disabled={applyingToJob === job.jobId}
                          >
                            {applyingToJob === job.jobId ? 'Applying...' : 'Apply'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isJobExpanded(job.jobId) && (
                    <tr className="job-description-row">
                      <td colSpan={6}>
                        <div className="job-description">
                          {job.description}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      }
    </div>
  );
};

export default ShortlistedJobs; 