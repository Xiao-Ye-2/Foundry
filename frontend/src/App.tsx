import React, { useState, useEffect, useRef } from "react";
import JobSearch from "./components/JobSearch";
import RoleSelection from "./components/RoleSelection";
import UserLogin from "./components/UserLogin";
import ProfileDropdown from "./components/ProfileDropdown";
import PostJob from "./components/PostJob";
import { UserProfile } from "./types";
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
  countryName?: string;
}

type UserRole = 'employee' | 'employer' | null;

interface JobApplication {
  applicationId?: number;
  employeeId: number;
  jobId: number;
  applicationDate?: string;
  status?: string;
  title?: string;
  companyName?: string;
}

// Transform the data to match our JobApplication interface
interface ApiApplication {
  EmployeeId: number;
  JobId: number;
  ApplyDate: string;
  Status: string;
  JobTitle?: string;
  CompanyName?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'post-job' | 'advanced'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applyingToJob, setApplyingToJob] = useState<number | null>(null);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string>("");
  const [expandedApplications, setExpandedApplications] = useState<number[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<number[]>([]);
  const [showProfileDropdown, setProfileShowDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [pageSize] = useState<number>(75);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate total pages
  const totalPages = Math.ceil(totalJobs / pageSize);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Load jobs when the component mounts or when the employee logs in
  useEffect(() => {
    if (employeeId !== null && jobs.length === 0) {
      handleGetJobs(currentPage);
    }
  }, [employeeId, jobs.length, currentPage]);

  // Load applications when the employee logs in or when the tab changes to 'applications'
  useEffect(() => {
    if (employeeId !== null && activeTab === 'applications') {
      handleGetApplications();
    }
  }, [employeeId, activeTab]);

  // Fetch total count on initial load
  useEffect(() => {
    fetchTotalJobCount();
  }, []);

  const handleGetJobs = async (page: number = 0) => {
    try {
      setLoading(true);
      setError("");
      
      // Include pagination parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      console.log(`Fetching jobs from: http://localhost:8080/api/jobs?${params.toString()}`);

      const response = await fetch(`http://localhost:8080/api/jobs?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit'
      });

      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      setJobs(data);
      
      // Fetch total count for pagination
      fetchTotalJobCount();
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
  
  // Fetch total job count
  const fetchTotalJobCount = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/jobs/count', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job count: ${response.status} ${response.statusText}`);
      }
      
      const count = await response.json();
      console.log(`Total job count: ${count}`);
      setTotalJobs(count);
    } catch (err) {
      console.error('Error fetching job count:', err);
    }
  };

  const handleGetApplications = async () => {
    if (!employeeId) return;

    try {
      setLoadingApplications(true);
      setApplicationError("");

      const response = await fetch(`http://localhost:8080/api/jobs/applications/employee/${employeeId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Application data from API:", data);

      // Transform the data to match our JobApplication interface
      const applications: JobApplication[] = data.map((app: ApiApplication) => ({
        employeeId: app.EmployeeId,
        jobId: app.JobId,
        applicationDate: app.ApplyDate,
        status: app.Status || 'Pending',
        title: app.JobTitle,
        companyName: app.CompanyName
      }));

      setApplications(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplicationError(error instanceof Error ? error.message : 'Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleApplyForJob = async (jobId: number) => {
    if (!employeeId) {
      alert('Please log in to apply for jobs');
      return;
    }

    try {
      setApplyingToJob(jobId);

      const response = await fetch('http://localhost:8080/api/jobs/apply', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employeeId,
          jobId: jobId.toString()
        }),
        credentials: 'omit'
      });

      if (response.status === 409) {
        alert('You have already applied for this job');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to submit application: ${response.status} ${response.statusText}`);
      }

      // After successfully applying, fetch the updated applications list
      // This ensures we have all the correct job data including company names
      await handleGetApplications();
      
      // Find job name from current jobs list (if applying from main page)
      const appliedJob = jobs.find(job => job.jobId === jobId);
      
      alert(`Application submitted successfully for job: ${appliedJob?.title || `ID: ${jobId}`}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again later.');
    } finally {
      setApplyingToJob(null);
    }
  };

  const handlePostJob = async (jobData: {
    title: string;
    description: string;
    cityId: number;
    minSalary: number;
    maxSalary: number;
    workType: string;
    requirements: string;
  }) => {
    if (!userProfile) {
      alert("You must be logged in to post a job.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/jobs/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": userProfile?.userId?.toString() || ''
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error(`Failed to post job: ${response.status} ${response.statusText}`);
      }

      alert("Job posted successfully!");
      handleGetJobs();
      setActiveTab('jobs');
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job. Please try again.");
    }
  };

  const hasAppliedForJob = (jobId: number) => {
    return applications.some(app => app.jobId === jobId);
  };

  const handleRoleSelection = (role: 'employee' | 'employer') => {
    setUserRole(role);
  };

  const handleEmployeeLogin = (data: UserProfile) => {
    console.log(data);
    setEmployeeId(data.userId);
    setUserProfile(data);
    console.log(`Employee logged in with ID: ${data.userId}`);
  };

  const handleEmployeeSignup = () => {
    setEmployeeId(null);
    console.log(`Employee signed up successfully`);
  }

  const handleSignOut = () => {
    setUserRole(null);
    setEmployeeId(null);
    setUserProfile(null);
    setApplications([]);
  };

  const toggleApplicationDetails = (jobId: number) => {
    setExpandedApplications(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const isApplicationExpanded = (jobId: number) => expandedApplications.includes(jobId);

  const toggleJobDetails = (jobId: number) => {
    setExpandedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const isJobExpanded = (jobId: number) => expandedJobs.includes(jobId);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    setLoading(true); // Set loading state before fetching
    handleGetJobs(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setLoading(true); // Set loading state before fetching
      handleGetJobs(newPage);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setLoading(true); // Set loading state before fetching
      handleGetJobs(newPage);
    }
  };

  // If no role is selected, show the role selection screen
  if (userRole === null) {
    return <RoleSelection onSelectRole={handleRoleSelection} />;
  }
  // // If employee role is selected but not logged in, show the login screen
  // if (userRole === 'employee' && employeeId === null) {
  //   return <UserLogin onLogin={handleEmployeeLogin} onBack={() => setUserRole(null)} onSignup={handleEmployeeSignup}/>;
  // }

  // // If employee role is selected but not logged in, show the login screen
  // if (userRole === 'employer' && employeeId === null) {
  //   return <UserLogin onLogin={handleEmployeeLogin} onBack={() => setUserRole(null)} onSignup={handleEmployeeSignup}/>;
  // }


  if (userProfile === null) {
    return <UserLogin onLogin={handleEmployeeLogin} onBack={() => setUserRole(null)} onSignup={handleEmployeeSignup} userRole={userRole} />;
  }
  // Show the job board (employee view)
  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="header-container">
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
          <div className="employee-info">
            <button
              className="employee-icon"
              onClick={() => setProfileShowDropdown(!showProfileDropdown)}
            >
              {/* Temporary Display */}
              {userProfile ? `${userRole} ID: ${userProfile.userId}` : 'Who am I?'}
            </button>
            {showProfileDropdown && (
              <div ref={dropdownRef}>
                {userProfile && <ProfileDropdown userProfile={userProfile} userRole={userRole}/>}
              </div>
            )}
          </div>
          <h1 className="app-title">Job Board</h1>
        </div>

        <div className="tab-container">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
          >
            Browse Jobs
          </button>

          {userRole === 'employee' ? (
            <button onClick={() => setActiveTab('applications')} className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}>
              My Applications
            </button>
          ) : (
            <button onClick={() => setActiveTab('post-job')} className={`tab-button ${activeTab === 'post-job' ? 'active' : ''}`}>
              Post a Job
            </button>
          )}

          <button
            onClick={() => setActiveTab('advanced')}
            className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          >
            Advanced Search
          </button>
        </div>

        {activeTab === 'jobs' && (
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
                <button className="primary-button" onClick={() => handleGetJobs(currentPage)}>
                  Refresh Jobs
                </button>
              </div>
            )}

            {jobs.length > 0 && (
              <>
                <div className="job-results">
                  <h3>Available Jobs ({totalJobs})</h3>
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
                                  {isJobExpanded(job.jobId) ? 'Hide Details' : 'Show Details'}
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
        )}

        {activeTab === "post-job" && userRole === "employer" && userProfile && (
          <div className="post-job-container">
            <PostJob
              userProfile={userProfile}
              onSubmit={handlePostJob}
            />
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-container">
            <h2>My Applications</h2>

            {loadingApplications && <div className="loading-indicator">Loading your applications...</div>}

            {applicationError && (
              <div className="error-message">
                {applicationError}
              </div>
            )}

            {!loadingApplications && !applicationError && applications.length === 0 && (
              <div className="no-applications-message">
                <p>You haven't applied to any jobs yet.</p>
                <button className="primary-button" onClick={() => setActiveTab('jobs')}>
                  Browse Jobs
                </button>
              </div>
            )}

            {!loadingApplications && !applicationError && applications.length > 0 && (
              <div className="applications-list">
                {applications.map((application) => {
                  // Find the corresponding job
                  const job = jobs.find(j => j.jobId === application.jobId);

                  return (
                    <div key={`${application.employeeId}-${application.jobId}`} className="application-card">
                      <div className="application-header">
                        <h3>{application.title || job?.title || `Job #${application.jobId}`}</h3>
                        <h4>{application.companyName || job?.companyName || 'Unknown Company'}</h4>
                      </div>

                      <div className="application-details">
                        <p><strong>Applied On:</strong> {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : 'Unknown'}</p>
                        <p><strong>Status:</strong> <span className={`status-${application.status?.toLowerCase()}`}>{application.status || 'Pending'}</span></p>
                      </div>

                      {job && isApplicationExpanded(job.jobId) && (
                        <div className="job-expanded-details">
                          <p><strong>Location:</strong> {job.cityName}{job.countryName ? `, ${job.countryName}` : ''}</p>
                          <p><strong>Salary Range:</strong> ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</p>
                          <p><strong>Work Type:</strong> {job.workType}</p>
                          <p><strong>Description:</strong></p>
                          <p className="job-description">{job.description}</p>
                        </div>
                      )}

                      {job && (
                        <button
                          className="view-job-button"
                          onClick={() => toggleApplicationDetails(job.jobId)}
                        >
                          {isApplicationExpanded(job.jobId) ? 'Hide Details' : 'View Job Details'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'advanced' && (
          <JobSearch
            employeeId={employeeId}
            onApplyForJob={handleApplyForJob}
            hasAppliedForJob={hasAppliedForJob}
            applyingToJob={applyingToJob}
          />
        )}
      </div>
    </div>
  );
};

export default App;