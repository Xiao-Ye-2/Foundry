import React from "react";

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

interface JobsListProps {
  jobs: Job[];
  loading: boolean;
  error: string;
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  applyingToJob: number | null;
  shortlistingJob: number | null;
  hasAppliedForJob: (jobId: number) => boolean;
  toggleJobDetails: (jobId: number) => void;
  handleApplyForJob: (jobId: number) => Promise<void>;
  handleShortlistClick: (jobId: number) => Promise<void>;
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  isJobExpanded: (jobId: number) => boolean;
  isJobShortlisted: (jobId: number) => boolean;
}

const JobsList: React.FC<JobsListProps> = ({
  jobs,
  loading,
  error,
  totalJobs,
  currentPage,
  totalPages,
  applyingToJob,
  hasAppliedForJob,
  toggleJobDetails,
  handleApplyForJob,
  handleShortlistClick,
  goToPage,
  goToPreviousPage,
  goToNextPage,
  isJobExpanded,
  isJobShortlisted,
  shortlistingJob
}) => {
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
          <button className="primary-button" onClick={() => goToPage(currentPage)}>
            Refresh Jobs
          </button>
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <div className="job-results">
            <div className="jobs-header">
              <h3>Available Jobs ({totalJobs})</h3>
              <button 
                className="refresh-button"
                onClick={() => goToPage(currentPage)}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Jobs'}
              </button>
            </div>
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
                  <React.Fragment key={job.jobId}>
                    <tr className={isJobExpanded(job.jobId) ? "job-row expanded" : "job-row"}>
                      <td className="position-col" data-label="Position">
                        <div className="job-title">{job.title}</div>
                      </td>
                      <td className="company-col" data-label="Company">{job.companyName}</td>
                      <td className="location-col" data-label="Location">{job.cityName}{job.countryName ? `, ${job.countryName}` : ''}</td>
                      <td className="salary-col" data-label="Salary">${job.minSalary.toLocaleString()}K - ${job.maxSalary.toLocaleString()}K</td>
                      <td className="work-type-col" data-label="Work Type">{job.workType}</td>
                      <td className="actions-col" data-label="Actions">
                        <div className="action-buttons">
                          <button
                            className="details-button"
                            onClick={() => toggleJobDetails(job.jobId)}
                          >
                            {isJobExpanded(job.jobId) ? 'Hide' : 'Show'}
                          </button>

                          <button
                            className={`shortlist-button ${isJobShortlisted(job.jobId) ? 'shortlisted' : ''}`}
                            onClick={() => handleShortlistClick(job.jobId)}
                            disabled={shortlistingJob === job.jobId}
                            title={isJobShortlisted(job.jobId) ? "Remove from shortlist" : "Save to shortlist"}
                          >
                            {shortlistingJob === job.jobId ? (
                              <span className="shortlist-loading">⏳</span>
                            ) : isJobShortlisted(job.jobId) ? (
                              <span className="shortlist-icon">★</span>
                            ) : (
                              <span className="shortlist-icon">☆</span>
                            )}
                          </button>

                          {hasAppliedForJob(job.jobId) ? (
                            <div className="applied-badge">Applied</div>
                          ) : (
                            <button
                              className="apply-button"
                              onClick={() => handleApplyForJob(job.jobId)}
                              disabled={applyingToJob === job.jobId}
                            >
                              {applyingToJob === job.jobId ? 'Applying...' : 'Apply Now'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isJobExpanded(job.jobId) && job.description && (
                      <tr className="job-description-row">
                        <td colSpan={6}>
                          <div className="job-description">
                            <p>{job.description}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button prev-button"
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
              >
                <span className="pagination-icon">«</span> Previous
              </button>
              
              <div className="pagination-numbers">
                {/* First page */}
                {currentPage > 1 && (
                  <button 
                    className="pagination-number"
                    onClick={() => goToPage(0)}
                  >
                    1
                  </button>
                )}
                
                {/* Ellipsis after first page */}
                {currentPage > 2 && <span className="pagination-ellipsis">…</span>}
                
                {/* Generate page numbers around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNumber = i;
                  } else if (currentPage <= 2) {
                    // Near start, show first 5 pages
                    pageNumber = i;
                  } else if (currentPage >= totalPages - 3) {
                    // Near end, show last 5 pages
                    pageNumber = totalPages - 5 + i;
                  } else {
                    // In middle, show 2 before and 2 after current
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  // Skip rendering if number is out of range
                  if (pageNumber < 0 || pageNumber >= totalPages) return null;
                  
                  // Skip first and last page if they'll be rendered separately
                  if ((currentPage > 1 && pageNumber === 0) || 
                      (currentPage < totalPages - 2 && pageNumber === totalPages - 1)) {
                    return null;
                  }
                  
                  return (
                    <button 
                      key={pageNumber}
                      className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber + 1}
                    </button>
                  );
                })}
                
                {/* Ellipsis before last page */}
                {currentPage < totalPages - 3 && <span className="pagination-ellipsis">…</span>}
                
                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <button 
                    className="pagination-number"
                    onClick={() => goToPage(totalPages - 1)}
                  >
                    {totalPages}
                  </button>
                )}
              </div>
              
              <button 
                className="pagination-button next-button"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                Next <span className="pagination-icon">»</span>
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default JobsList; 