import React from 'react';

interface JobApplication {
  applicationId?: number;
  employeeId: number;
  jobId: number;
  applicationDate?: string;
  status?: string;
  title?: string;
  companyName?: string;
}

interface EmployeeApplicationsProps {
  applications: JobApplication[];
  loadingApplications: boolean;
  applicationError: string;
  onBrowseJobs: () => void;
  onRefresh?: () => void;
}

const EmployeeApplications: React.FC<EmployeeApplicationsProps> = ({
  applications,
  loadingApplications,
  applicationError,
  onBrowseJobs,
  onRefresh
}) => {
  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>My Applications</h2>
        {onRefresh && (
          <button 
            className="refresh-button"
            onClick={onRefresh}
            disabled={loadingApplications}
          >
            {loadingApplications ? 'Refreshing...' : 'Refresh Applications'}
          </button>
        )}
      </div>

      {loadingApplications && <div className="loading-indicator">
        <span className="loading-icon">⏳</span> Loading your applications...
      </div>}

      {applicationError && (
        <div className="error-message">
          <span className="error-icon">⚠️</span> {applicationError}
        </div>
      )}

      {!loadingApplications && !applicationError && applications.length === 0 && (
        <div className="no-applications-message">
          <span className="empty-icon">📋</span>
          <p>You haven't applied to any jobs yet.</p>
          <button className="primary-button" onClick={onBrowseJobs}>
            Browse Jobs
          </button>
        </div>
      )}

      {!loadingApplications && !applicationError && applications.length > 0 && (
        <div className="applications-table-container">
          <table className="job-table">
            <thead>
              <tr>
                <th className="position-col">Position</th>
                <th className="company-col">Company</th>
                <th className="applied-col">Applied On</th>
                <th className="status-col">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => {                
                return (
                  <tr key={`${application.employeeId}-${application.jobId}`}>
                    <td className="position-col" data-label="Position">
                      <span className="job-title">{application.title || `Job #${application.jobId}`}</span>
                    </td>
                    <td className="company-col" data-label="Company">
                      <span className="company-name">{application.companyName || 'Unknown Company'}</span>
                    </td>
                    <td className="applied-col" data-label="Applied On">
                      {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="status-col" data-label="Status">
                      <span className={`status-${application.status?.toLowerCase()}`}>
                        {application.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeApplications; 