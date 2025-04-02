import React, { useState, useEffect, useRef } from "react";
import JobSearch from "./components/JobSearch";
import RoleSelection from "./components/RoleSelection";
import UserLogin from "./components/UserLogin";
import ProfileDropdown from "./components/ProfileDropdown";
import PostJob from "./components/PostJob";
import ShortlistedJobs from "./components/ShortlistedJobs";
import EmployeeApplications from "./components/EmployeeApplications";
import Analysis from "./components/Analysis";
import JobsList from "./components/JobsList";
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
  applyCount?: number;
  dislikeCount?: number;
  shortlistCount?: number;
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

interface EmployerApplication {
  jobId: number;
  jobTitle: string;
  userName: string;
  email: string;
  resume: string | null;
  employeeId: number;
  applyDate: string;
  status: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'post-job' | 'advanced' | 'shortlist' | 'analysis' | 'applicants'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applyingToJob, setApplyingToJob] = useState<number | null>(null);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string>("");
  const [expandedJobs, setExpandedJobs] = useState<number[]>([]);
  const [showProfileDropdown, setProfileShowDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [employerApplications, setEmployerApplications] = useState<EmployerApplication[]>([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [pageSize] = useState<number>(75);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate total pages
  const totalPages = Math.ceil(totalJobs / pageSize);

  //shortlist 
  const [shortlistedJobs, setShortlistedJobs] = useState<number[]>([]);
  const [shortlistingJob, setShortlistingJob] = useState<number | null>(null);

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

  // Load applications when the employee logs in
  useEffect(() => {
    if (employeeId !== null) {
      handleGetApplications();
    }
  }, [employeeId]);

  // Load applications when the tab changes to relevant tabs
  useEffect(() => {
    if (employeeId !== null && (activeTab === 'applications' || activeTab === 'jobs')) {
      handleGetApplications();
    }
  }, [activeTab]);

  // Fetch total count on initial load
  useEffect(() => {
    fetchTotalJobCount();
  }, []);

  
  useEffect(() => {
    if (activeTab === 'jobs' && employeeId) {
      fetchShortlistedJobs();
    }
  }, [activeTab, employeeId]);

    
  useEffect(() => {
    if (userRole === 'employer' && activeTab === 'applicants') {
      fetchEmployerApplications();
    }
  }, [userRole, activeTab]);

  // Add this effect to set the default tab based on user role
  useEffect(() => {
    if (userRole === 'employer') {
      setActiveTab('post-job');
    } else if (userRole === 'employee') {
      setActiveTab('jobs');
    }
  }, [userRole]);

  const handleGetJobs = async (page: number = 0) => {
    try {
      setLoading(true);
      setError("");
      
      // Include pagination parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      // Include employeeId to filter out disliked jobs
      if (employeeId) {
        params.append('userId', employeeId.toString());
      }
      
      // Use /api/jobs/search endpoint instead of /api/jobs
      console.log(`Fetching jobs from: http://localhost:8080/api/jobs/search?${params.toString()}`);

      const response = await fetch(`http://localhost:8080/api/jobs/search?${params.toString()}`, {
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
      // Check if job statistics are included in the response
      if (data.length > 0) {
        console.log('Job stats example:', {
          jobId: data[0].jobId,
          applyCount: data[0].applyCount,
          shortlistCount: data[0].shortlistCount, 
          dislikeCount: data[0].dislikeCount
        });
      }
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
  
  // Handle Shortlist click
  const handleShortlistClick = async (jobId: number) => {
    if (!employeeId) {
      alert('Please log in to shortlist jobs');
      return;
    }

    setShortlistingJob(jobId);
    
    try {
      if (shortlistedJobs.includes(jobId)) {
        // Remove from shortlisted jobs
        await fetch(`http://localhost:8080/api/jobs/shortlist?employeeId=${employeeId}&jobId=${jobId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        setShortlistedJobs(prev => prev.filter(id => id !== jobId));
        
        // Decrement the job's shortlistCount in the local state
        setJobs(prevJobs => prevJobs.map(job => 
          job.jobId === jobId 
            ? { ...job, shortlistCount: Math.max(0, (job.shortlistCount || 1) - 1) } 
            : job
        ));
      } else {
        // Add to shortlisted jobs
        await fetch(`http://localhost:8080/api/jobs/shortlist?employeeId=${employeeId}&jobId=${jobId}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        setShortlistedJobs(prev => [...prev, jobId]);
        
        // Increment the job's shortlistCount in the local state
        setJobs(prevJobs => prevJobs.map(job => 
          job.jobId === jobId 
            ? { ...job, shortlistCount: (job.shortlistCount || 0) + 1 } 
            : job
        ));
      }
    } catch (error) {
      console.error('Error toggling job shortlist:', error);
    } finally {
      setShortlistingJob(null);
    }
  };
  
  // Check if a job is shortlisted
  const isJobShortlisted = (jobId: number) => shortlistedJobs.includes(jobId);

  const fetchShortlistedJobs = async () => {
    if (!employeeId) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/jobs/shortlist/${employeeId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setShortlistedJobs(data.map((job: Job) => job.jobId));
      }
    } catch (error) {
      console.error('Error fetching shortlisted jobs:', error);
    }
  };
  // Fetch total job count
  const fetchTotalJobCount = async () => {
    try {
      // Include userId parameter to filter out disliked jobs
      const params = new URLSearchParams();
      if (employeeId) {
        params.append('userId', employeeId.toString());
      }
      
      // Use the correct count endpoint
      const url = `http://localhost:8080/api/jobs/count${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
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
      console.log(`Applying for job ID: ${jobId}`);

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

      // Find job title from jobs list
      const appliedJob = jobs.find(job => job.jobId === jobId);
      const appliedJobTitle = appliedJob?.title || `Job #${jobId}`;

      // Immediately update our local state with the new application
      // This ensures the UI updates right away without waiting for API fetch
      const newApplication: JobApplication = {
        employeeId: employeeId,
        jobId: jobId,
        applicationDate: new Date().toISOString(),
        status: 'Pending',
        title: appliedJobTitle,
        companyName: appliedJob?.companyName || 'Unknown Company'
      };

      setApplications(prevApplications => [...prevApplications, newApplication]);
      
      // Update the job's applyCount in the local state
      setJobs(prevJobs => prevJobs.map(job => 
        job.jobId === jobId 
          ? { ...job, applyCount: (job.applyCount || 0) + 1 } 
          : job
      ));

      // Still fetch all applications in the background to ensure data consistency
      handleGetApplications();

      alert(`Application submitted successfully for job: ${appliedJobTitle}`);
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
      // Fetch new job list in the background for data consistency
      handleGetJobs();
      // Redirect to the applicants tab instead of jobs (which is hidden for employers)
      setActiveTab('applicants');
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job. Please try again.");
    }
  };

  const handleChangeApplicationStatus = async (employeeId: number, jobId: number, status: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/jobs/applications/employer/changestatus/?employeeId=${employeeId}&jobId=${jobId}&status=${status}`, 
        {
          method: 'GET', // Your endpoint uses GET, though typically this would be PUT
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'omit'
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to change status: ${response.status} ${response.statusText}`);
      }
  
      // Update the status locally to avoid refetching all applications
      setEmployerApplications(prevApplications => 
        prevApplications.map(app => 
          (app.employeeId === employeeId && parseInt(app.jobId.toString()) === jobId)
            ? { ...app, status: status } 
            : app
        )
      );
      fetchEmployerApplications();
  
      alert(`Application status changed to ${status} successfully`);
    } catch (error) {
      console.error('Error changing application status:', error);
      alert('Failed to change application status. Please try again.');
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

  // Handle browsing jobs from shortlist
  const handleBrowseJobs = () => {
    setActiveTab('jobs');
  };

  const fetchEmployerApplications = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("http://localhost:8080/api/jobs/applications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-id": userProfile?.userId?.toString() || ""
        }
      });
  
      if (!response.ok) throw new Error("Failed to fetch applications");
  
      const data = await response.json();
      console.log("Employer applications:", data);
      setEmployerApplications(data);
    } catch (err) {
      console.error("Error fetching employer applications:", err);
    } finally {
      setLoading(false);
    }
  };
  

  // If no role is selected, show the role selection screen
  if (userRole === null) {
    return <RoleSelection onSelectRole={handleRoleSelection} />;
  }

  if (userProfile === null) {
    return <UserLogin onLogin={handleEmployeeLogin} onBack={() => setUserRole(null)} onSignup={handleEmployeeSignup} userRole={userRole} />;
  }

  // Add this function near the other handlers
  const handleRefreshJobs = () => {
    handleGetJobs(currentPage);
  };

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
          {userRole === 'employee' && (
            <>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
              >
                Browse Jobs
              </button>
              
              <button onClick={() => setActiveTab('applications')} className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}>
                My Applications
              </button>
              
              <button onClick={() => setActiveTab('shortlist')} className={`tab-button ${activeTab === 'shortlist' ? 'active' : ''}`}>
                Shortlist
              </button>
              
              <button
                onClick={() => setActiveTab('advanced')}
                className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
              >
                Advanced Search
              </button>
            </>
          )}
          
          {userRole === 'employer' && (
            <>
              <button onClick={() => setActiveTab('post-job')} className={`tab-button ${activeTab === 'post-job' ? 'active' : ''}`}>
                Post a Job
              </button>
              
              <button onClick={() => setActiveTab('applicants')} className={`tab-button ${activeTab === 'applicants' ? 'active' : ''}`}>
                Applicants
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('analysis')}
            className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
          >
            Analysis
          </button>
        </div>

        {activeTab === 'jobs' && (
          <div className="jobs-container">
            <JobsList
              jobs={jobs}
              loading={loading}
              error={error}
              totalJobs={totalJobs}
              currentPage={currentPage}
              totalPages={totalPages}
              applyingToJob={applyingToJob}
              shortlistingJob={shortlistingJob}
              employeeId={employeeId}
              hasAppliedForJob={hasAppliedForJob}
              toggleJobDetails={toggleJobDetails}
              handleApplyForJob={handleApplyForJob}
              handleShortlistClick={handleShortlistClick}
              goToPage={goToPage}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
              isJobExpanded={isJobExpanded}
              isJobShortlisted={isJobShortlisted}
              onRefresh={handleRefreshJobs}
            />
          </div>
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
          <EmployeeApplications
            applications={applications}
            loadingApplications={loadingApplications}
            applicationError={applicationError}
            onBrowseJobs={handleBrowseJobs}
            onRefresh={handleGetApplications}
          />
        )}

        {activeTab === 'shortlist' && (
          <ShortlistedJobs 
            employeeId={employeeId}
            hasAppliedForJob={hasAppliedForJob}
            onApplyForJob={handleApplyForJob}
            applyingToJob={applyingToJob}
            onBrowseJobs={handleBrowseJobs}
          />
        )}

        {activeTab === 'advanced' && (
          <JobSearch
            employeeId={employeeId}
            onApplyForJob={handleApplyForJob}
            hasAppliedForJob={hasAppliedForJob}
            applyingToJob={applyingToJob}
          />
        )}

        {activeTab === 'analysis' && (
          <Analysis userRole={userRole} userId={userProfile.userId}
          />
        )}

        {activeTab === 'applicants' && userRole === 'employer' && (
          <div className="employer-applications-container">
            <div className="applications-header">
              <h2>Applications to Your Jobs</h2>
              <button 
                className="refresh-button"
                onClick={fetchEmployerApplications}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Applicants'}
              </button>
            </div>
            {loading && <div className="loading-indicator">Loading applications...</div>}
            {employerApplications.length === 0 && !loading ? (
              <p className="no-applicants-message">No applications found.</p>
            ) : (
              <div className="applications-table-container">
                <table className="employer-applicant-table">
                  <thead>
                    <tr>
                    <th>Job Title</th>
                    <th>Applicant Name</th>
                    <th>Email</th>
                    <th>Apply Date</th>
                    <th>Status</th>
                    <th>Resume</th>
                    <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employerApplications.map((app, index) => (
                      <tr key={index}>
                        <td>{app.jobTitle}</td>
                        <td>{app.userName}</td>
                        <td>{app.email}</td>
                        <td>
                          {app.applyDate && !isNaN(new Date(app.applyDate).getTime())
                            ? new Date(app.applyDate).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td>
                          <span className={`status-${app.status?.toLowerCase() || 'pending'}`}>
                            {app.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          {app.resume ? (
                            <a 
                              href={app.resume} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="resume-link"
                            >
                              View Resume
                            </a>
                          ) : (
                            <span className="no-resume">No Resume</span>
                          )}
                        </td>
                        <td>
                        {app.status === 'Pending' && (
                          <div className="status-dropdown">
                            <select 
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                if (newStatus !== "") {
                                  handleChangeApplicationStatus(app.employeeId, parseInt(app.jobId.toString()), newStatus);
                                }
                              }}
                              value=""
                            >
                              <option value=""></option>
                              <option value="Accepted">Accept  </option>
                              <option value="Rejected">Reject  </option>
                            </select>
                          </div>
                        )}
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
};

export default App;