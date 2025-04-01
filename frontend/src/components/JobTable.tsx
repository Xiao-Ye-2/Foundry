import React from 'react';
import Pagination from './Pagination';
import JobRow from './JobRow';

interface Job {
  jobId: number;
  title: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  workType: string;
  cityName: string;
  companyName: string;
  isActive?: boolean;
  postDate?: string;
  countryName?: string;
}

interface JobTableProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  applyingToJob: number | null;
  shortlistingJob: number | null;
  dislikingJob?: number | null;
  expandedJobIds?: number[];
  isJobExpanded?: (jobId: number) => boolean;
  recommendedJobIds?: number[];
  onToggleJobDetails: (jobId: number) => void;
  onApplyForJob: (jobId: number) => Promise<void>;
  onShortlistJob: (jobId: number) => Promise<void>;
  onDislikeJob?: (jobId: number) => Promise<void>;
  onRecommendJob?: (jobId: number) => void;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  hasAppliedForJob: (jobId: number) => boolean;
  isJobShortlisted: (jobId: number) => boolean;
  renderJobRecommendations?: (jobId: number) => React.ReactNode;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
  customHeader?: React.ReactNode;
}

const JobTable: React.FC<JobTableProps> = ({
  jobs,
  loading,
  error,
  totalJobs,
  currentPage,
  totalPages,
  applyingToJob,
  shortlistingJob,
  dislikingJob,
  expandedJobIds = [],
  isJobExpanded,
  recommendedJobIds = [],
  onToggleJobDetails,
  onApplyForJob,
  onShortlistJob,
  onDislikeJob,
  onRecommendJob,
  goToPage,
  goToPreviousPage,
  goToNextPage,
  hasAppliedForJob,
  isJobShortlisted,
  renderJobRecommendations,
  onRefresh,
  showRefreshButton = true,
  customHeader
}) => {
  // Function to check if a job is expanded
  const checkIfJobExpanded = (jobId: number): boolean => {
    if (isJobExpanded) {
      return isJobExpanded(jobId);
    }
    return expandedJobIds.includes(jobId);
  };

  return (
    <>
      {loading && (
        <div className="loading-indicator">
          {jobs.length > 0 ? 'Loading more jobs...' : 'Loading jobs...'}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="no-jobs-message">
          <p>No jobs available. Please try again later.</p>
          <button className="primary-button" onClick={onRefresh || (() => goToPage(currentPage))}>
            Refresh Jobs
          </button>
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <div className="job-results">
            {customHeader ? (
              customHeader
            ) : (
              <div className="jobs-header">
                <h3>Available Jobs ({totalJobs})</h3>
                {showRefreshButton && onRefresh && (
                  <button 
                    className="refresh-button"
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    {loading ? 'Refreshing...' : 'Refresh Jobs'}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="job-table-container">
            <table className="job-table" style={loading ? { opacity: '0.7' } : {}}>
              <thead>
                <tr>
                  <th className="position-col">Position</th>
                  <th className="company-col">Company</th>
                  <th className="location-col">Location</th>
                  <th className="salary-col">Salary</th>
                  <th className="work-type-col">Work Type</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <JobRow
                    key={job.jobId}
                    job={job}
                    isExpanded={checkIfJobExpanded(job.jobId)}
                    isShortlisted={isJobShortlisted(job.jobId)}
                    hasApplied={hasAppliedForJob(job.jobId)}
                    applyingToJob={applyingToJob}
                    shortlistingJob={shortlistingJob}
                    dislikingJob={dislikingJob}
                    onToggleDetails={onToggleJobDetails}
                    onApply={onApplyForJob}
                    onShortlist={onShortlistJob}
                    onDislike={onDislikeJob}
                    onRecommend={onRecommendJob}
                    showRecommendations={recommendedJobIds.includes(job.jobId)}
                    renderRecommendations={renderJobRecommendations}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              goToPage={goToPage}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
            />
          )}
        </>
      )}
    </>
  );
};

export default JobTable; 