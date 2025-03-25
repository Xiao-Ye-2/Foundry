import React, { useState } from 'react';
import '../styles/JobSearch.css';

interface Job {
  jobId: number;
  title: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  workType: string;
  companyName: string;
  cityName: string;
  countryName: string;
}

interface JobRecommendationsProps {
  employeeId: number | null;
  jobId: number | null;
  onClose: () => void;
  onApplyForJob: (jobId: number) => Promise<void>;
  hasAppliedForJob: (jobId: number) => boolean;
  applyingToJob: number | null;
  onShortlistToggle: (jobId: number) => Promise<void>;
  isJobShortlisted: (jobId: number) => boolean;
  shortlistingJob: number | null;
  inline?: boolean;
}

interface RecommendationState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
}

const JobRecommendations: React.FC<JobRecommendationsProps> = ({
  employeeId,
  jobId,
  onClose,
  onApplyForJob,
  hasAppliedForJob,
  applyingToJob,
  onShortlistToggle,
  isJobShortlisted,
  shortlistingJob,
  inline = true
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationState>({
    jobs: [],
    loading: false,
    error: null
  });

  // Fetch recommendations when jobId changes
  React.useEffect(() => {
    const fetchRecommendations = async () => {
      if (!jobId || !employeeId) return;
      
      try {
        setRecommendations({
          jobs: [],
          loading: true,
          error: null
        });
        
        const response = await fetch(`http://localhost:8080/api/jobs/recommendations?jobId=${jobId}&userId=${employeeId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        setRecommendations({
          jobs: data,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations({
          jobs: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load recommendations'
        });
      }
    };
    
    fetchRecommendations();
  }, [jobId, employeeId]);

  const handleApplyClick = async (jobId: number) => {
    try {
      await onApplyForJob(jobId);
    } catch (error) {
      console.error("Error applying for job:", error);
    }
  };

  const containerClass = inline 
    ? "inline-recommendations-container" 
    : "recommendations-container";

  const listClass = inline 
    ? "inline-recommendations-list" 
    : "recommendations-list";

  if (!jobId) return null;
  
  return (
    <div className={containerClass}>
      <div className="recommendations-header">
        <h3>Similar Jobs You Might Like</h3>
        {!inline && (
          <button className="close-recommendations" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      
      {recommendations.loading && (
        <div className="recommendations-loading">
          <span className="loading-icon">⏳</span> Finding similar jobs...
        </div>
      )}
      
      {recommendations.error && (
        <div className="recommendations-error">
          <span className="error-icon">⚠️</span> {recommendations.error}
        </div>
      )}
      
      {!recommendations.loading && !recommendations.error && recommendations.jobs.length === 0 && (
        <div className="no-recommendations">
          No similar jobs found. Try another job or change your search criteria.
        </div>
      )}
      
      {!recommendations.loading && !recommendations.error && recommendations.jobs.length > 0 && (
        <div className={listClass}>
          {recommendations.jobs.map((job) => (
            <div key={job.jobId} className="recommendation-card">
              <div className="recommendation-header">
                <h4>{job.title}</h4>
                <p className="company-name">{job.companyName}</p>
              </div>
              <div className="recommendation-details">
                <p><strong>Location:</strong> {job.cityName}{job.countryName ? `, ${job.countryName}` : ''}</p>
                <p><strong>Salary:</strong> ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</p>
                <p><strong>Work Type:</strong> {job.workType}</p>
              </div>
              <div className="recommendation-actions">
                <button
                  className={`rec-shortlist-button ${isJobShortlisted(job.jobId) ? 'shortlisted' : ''}`}
                  onClick={() => onShortlistToggle(job.jobId)}
                  disabled={shortlistingJob === job.jobId}
                >
                  {shortlistingJob === job.jobId ? 
                    "Shortlisting..." : 
                    isJobShortlisted(job.jobId) ? "Saved" : "Add to Shortlist"}
                </button>
                
                {hasAppliedForJob(job.jobId) ? (
                  <div className="applied-badge">Applied</div>
                ) : (
                  <button 
                    className="apply-button"
                    onClick={() => handleApplyClick(job.jobId)}
                    disabled={applyingToJob === job.jobId}
                  >
                    {applyingToJob === job.jobId ? 'Applying...' : 'Apply'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobRecommendations; 