import React, { useState } from "react";
import JobTable from "./JobTable";
import JobRecommendations from "./JobRecommendations";

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
  applyCount?: number;
  dislikeCount?: number;
  shortlistCount?: number;
}

interface JobsListProps {
  jobs: Job[];
  loading: boolean;
  error: string;
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  applyingToJob: number | null;
  shortlistingJob: number | null;
  employeeId: number | null;
  hasAppliedForJob: (jobId: number) => boolean;
  toggleJobDetails: (jobId: number) => void;
  handleApplyForJob: (jobId: number) => Promise<void>;
  handleShortlistClick: (jobId: number) => Promise<void>;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  isJobExpanded: (jobId: number) => boolean;
  isJobShortlisted: (jobId: number) => boolean;
  onRefresh?: () => void;
}

const JobsList: React.FC<JobsListProps> = ({
  jobs,
  loading,
  error,
  totalJobs,
  currentPage,
  totalPages,
  applyingToJob,
  employeeId,
  hasAppliedForJob,
  toggleJobDetails,
  handleApplyForJob,
  handleShortlistClick,
  goToPage,
  goToPreviousPage,
  goToNextPage,
  isJobExpanded,
  isJobShortlisted,
  shortlistingJob,
  onRefresh
}) => {
  // Calculate expandedJobIds from isJobExpanded function
  const expandedJobIds = jobs.filter(job => isJobExpanded(job.jobId)).map(job => job.jobId);
  
  // State for disliking jobs
  const [dislikingJob, setDislikingJob] = useState<number | null>(null);
  
  // State for recommended jobs
  const [recommendedJobIds, setRecommendedJobIds] = useState<number[]>([]);
  
  // Handle dislike click
  const handleDislikeClick = async (jobId: number) => {
    if (!employeeId) {
      alert('Please log in to hide jobs');
      return;
    }

    setDislikingJob(jobId);
    
    try {
      // Parse IDs as numbers to ensure they're treated as Long values on the backend
      const parsedEmployeeId = Number(employeeId);
      const parsedJobId = Number(jobId);
      
      // Send a POST request to dislike the job
      await fetch(`http://localhost:8080/api/jobs/dislike?employeeId=${parsedEmployeeId}&jobId=${parsedJobId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      // If this job has recommendations open, close them
      if (recommendedJobIds.includes(jobId)) {
        setRecommendedJobIds(prevIds => prevIds.filter(id => id !== jobId));
      }
      
      // Remove the job from the displayed list after a slight delay
      setTimeout(() => {
        // Refresh the job list if a callback is provided
        if (onRefresh) {
          onRefresh();
        }
      }, 500);
    } catch (error) {
      console.error('Error disliking job:', error);
    } finally {
      setDislikingJob(null);
    }
  };
  
  // Function to toggle job recommendations
  const toggleJobRecommendations = (jobId: number) => {
    if (!employeeId) {
      alert('Please log in to see job recommendations');
      return;
    }
    
    // If clicking on the same job, toggle recommendations off
    if (recommendedJobIds.includes(jobId)) {
      setRecommendedJobIds(prevIds => prevIds.filter(id => id !== jobId));
    } else {
      // If we're showing job details, close them first (handled by JobTable/JobRow)
      
      // Set the job ID for recommendations
      setRecommendedJobIds(prevIds => [...prevIds, jobId]);
    }
  };

  // Create custom header with refresh button
  const customHeader = (
    <div className="jobs-header">
      <h3>Available Jobs ({totalJobs})</h3>
      {onRefresh && (
        <button 
          className="custom-refresh-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Jobs'}
        </button>
      )}
    </div>
  );

  return (
    <JobTable
      jobs={jobs}
      loading={loading}
      error={error}
      totalJobs={totalJobs}
      currentPage={currentPage}
      totalPages={totalPages}
      applyingToJob={applyingToJob}
      shortlistingJob={shortlistingJob}
      dislikingJob={dislikingJob}
      expandedJobIds={expandedJobIds}
      recommendedJobIds={recommendedJobIds}
      onToggleJobDetails={toggleJobDetails}
      onApplyForJob={handleApplyForJob}
      onShortlistJob={handleShortlistClick}
      onDislikeJob={handleDislikeClick}
      onRecommendJob={toggleJobRecommendations}
      goToPage={goToPage}
      goToPreviousPage={goToPreviousPage}
      goToNextPage={goToNextPage}
      hasAppliedForJob={hasAppliedForJob}
      isJobShortlisted={isJobShortlisted}
      onRefresh={onRefresh}
      showRefreshButton={false}
      customHeader={customHeader}
      renderJobRecommendations={(jobId) => (
        <JobRecommendations
          employeeId={employeeId}
          jobId={jobId}
          onClose={() => setRecommendedJobIds(prev => prev.filter(id => id !== jobId))}
          onApplyForJob={handleApplyForJob}
          hasAppliedForJob={hasAppliedForJob}
          applyingToJob={applyingToJob}
          onShortlistToggle={handleShortlistClick}
          isJobShortlisted={isJobShortlisted}
          shortlistingJob={shortlistingJob}
          inline={true}
        />
      )}
    />
  );
};

export default JobsList; 