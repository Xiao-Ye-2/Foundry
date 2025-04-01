import React from 'react';

interface Job {
  jobId: number;
  title: string;
  description: string;
  minSalary: number;
  maxSalary: number;
  workType: string;
  cityName: string;
  companyName: string;
  countryName?: string;
  applyCount?: number;
  dislikeCount?: number;
  shortlistCount?: number;
}

interface JobRowProps {
  job: Job;
  isExpanded: boolean;
  isShortlisted: boolean;
  hasApplied: boolean;
  applyingToJob: number | null;
  shortlistingJob: number | null;
  dislikingJob?: number | null;
  onToggleDetails: (jobId: number) => void;
  onApply: (jobId: number) => Promise<void>;
  onShortlist: (jobId: number) => Promise<void>;
  onDislike?: (jobId: number) => Promise<void>;
  onRecommend?: (jobId: number) => void;
  showRecommendations?: boolean;
  renderRecommendations?: (jobId: number) => React.ReactNode;
}

const JobRow: React.FC<JobRowProps> = ({
  job,
  isExpanded,
  isShortlisted,
  hasApplied,
  applyingToJob,
  shortlistingJob,
  dislikingJob,
  onToggleDetails,
  onApply,
  onShortlist,
  onDislike,
  onRecommend,
  showRecommendations,
  renderRecommendations
}) => {
  return (
    <React.Fragment>
      <tr className={isExpanded ? "job-row expanded" : "job-row"}>
        <td className="position-col" data-label="Position">
          <div className="job-title">{job.title}</div>
        </td>
        <td className="company-col" data-label="Company">{job.companyName}</td>
        <td className="location-col" data-label="Location">
          {job.cityName}{job.countryName ? `, ${job.countryName}` : ''}
        </td>
        <td className="salary-col" data-label="Salary">
          ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}
        </td>
        <td className="work-type-col" data-label="Work Type">{job.workType}</td>
        <td className="stats-col" data-label="Stats">
          <div className="job-stats">
            <span title="Applications" className="stat-item">
              <span className="stat-icon">👔</span> {job.applyCount || 0}
            </span>
            <span title="Shortlists" className="stat-item">
              <span className="stat-icon">★</span> {job.shortlistCount || 0}
            </span>
            <span title="Dislikes" className="stat-item">
              <span className="stat-icon">👎</span> {job.dislikeCount || 0}
            </span>
          </div>
        </td>
        <td className="actions-col" data-label="Actions">
          <div className="action-buttons">
            <button
              className="details-button"
              onClick={() => onToggleDetails(job.jobId)}
            >
              {isExpanded ? 'Hide' : 'Details'}
            </button>

            <button
              className={`shortlist-button ${isShortlisted ? 'shortlisted' : ''}`}
              onClick={() => onShortlist(job.jobId)}
              disabled={shortlistingJob === job.jobId}
              title={isShortlisted ? "Remove from shortlist" : "Save to shortlist"}
            >
              {shortlistingJob === job.jobId ? (
                <span className="shortlist-loading">⏳</span>
              ) : isShortlisted ? (
                <span className="shortlist-icon">★</span>
              ) : (
                <span className="shortlist-icon">☆</span>
              )}
            </button>

            {onDislike && (
              <button
                className="dislike-button"
                onClick={() => onDislike(job.jobId)}
                disabled={dislikingJob === job.jobId}
                title="Hide this job"
              >
                {dislikingJob === job.jobId ? (
                  <span className="dislike-loading">⏳</span>
                ) : (
                  <span className="dislike-icon">👎</span>
                )}
              </button>
            )}

            {onRecommend && (
              <button
                className={`recommend-button ${showRecommendations ? 'active' : ''}`}
                onClick={() => onRecommend(job.jobId)}
                title="See similar jobs"
              >
                <span className="recommend-icon">👍</span>
              </button>
            )}

            {hasApplied ? (
              <div className="applied-badge">Applied</div>
            ) : (
              <button
                className="apply-button"
                onClick={() => onApply(job.jobId)}
                disabled={applyingToJob === job.jobId}
              >
                {applyingToJob === job.jobId ? 'Applying...' : 'Apply'}
              </button>
            )}
          </div>
        </td>
      </tr>

      {isExpanded && job.description && (
        <tr className="job-description-row">
          <td colSpan={7}>
            <div className="job-description">
              <p>{job.description}</p>
            </div>
          </td>
        </tr>
      )}

      {showRecommendations && renderRecommendations && (
        <tr className="job-recommendations-row">
          <td colSpan={7}>
            {renderRecommendations(job.jobId)}
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default JobRow; 