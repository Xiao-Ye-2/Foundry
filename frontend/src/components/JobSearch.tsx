import React, { useState, useEffect } from 'react';
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

interface JobSearchProps {
  employeeId: number | null;
  onApplyForJob: (jobId: number) => Promise<void>;
  hasAppliedForJob: (jobId: number) => boolean;
  applyingToJob: number | null;
}

const JobSearch: React.FC<JobSearchProps> = ({ 
  onApplyForJob, 
  hasAppliedForJob,
  applyingToJob
}) => {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [pageSize] = useState<number>(75);
  
  // Filter states
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [workType, setWorkType] = useState<string>('');
  
  // Work type options based on database schema constraints
  const workTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'];
  
  // Country options based on database
  const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'China'];
  
  // State for expanded job cards
  const [expandedJobIds, setExpandedJobIds] = useState<number[]>([]);
  
  // Added state to track if a search has been performed
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  // Toggle job details expansion
  const toggleJobDetails = (jobId: number) => {
    setExpandedJobIds(prevIds => 
      prevIds.includes(jobId) 
        ? prevIds.filter(id => id !== jobId) 
        : [...prevIds, jobId]
    );
  };
  
  // Check if a job is expanded
  const isJobExpanded = (jobId: number) => expandedJobIds.includes(jobId);
  
  // Reset expanded jobs when filters change
  useEffect(() => {
    setExpandedJobIds([]);
  }, [city, country, minSalary, maxSalary, workType]);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalJobs / pageSize);
  
  // Fetch total job count
  const fetchTotalCount = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (country) params.append('country', country);
      if (minSalary) params.append('minSalary', minSalary);
      if (maxSalary) params.append('maxSalary', maxSalary);
      if (workType) params.append('workType', workType);
      
      const url = `http://localhost:8080/api/jobs/count?${params.toString()}`;
      console.log(`Fetching job count from: ${url}`);
      
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
  
  // Fetch jobs with pagination
  const fetchJobs = async (page: number = 0) => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (country) params.append('country', country);
      if (minSalary) params.append('minSalary', minSalary);
      if (maxSalary) params.append('maxSalary', maxSalary);
      if (workType) params.append('workType', workType);
      
      // Always include pagination parameters
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      // Determine which endpoint to use
      const baseUrl = 'http://localhost:8080/api/jobs';
      const url = (city || country || minSalary || maxSalary || workType) 
        ? `${baseUrl}/search?${params.toString()}`
        : `${baseUrl}?${params.toString()}`;
      
      console.log(`Fetching jobs from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} jobs for page ${page}`);
      setFilteredJobs(data);
      
      // Also fetch total count for pagination
      await fetchTotalCount();
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch initial total count silently (without loading state)
  const fetchInitialCount = async () => {
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
      console.log(`Initial total job count: ${count}`);
      setTotalJobs(count);
    } catch (err) {
      console.error('Error fetching initial job count:', err);
    }
  };
  
  // Fetch initial total count on component mount
  useEffect(() => {
    fetchInitialCount();
  }, []);

  // Fetch jobs only when search is performed or page is changed
  useEffect(() => {
    if (hasSearched) {
      fetchJobs(currentPage);
    }
  }, [currentPage, hasSearched, city, country, minSalary, maxSalary, workType]);
  
  // Apply filters
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    setHasSearched(true);
    // fetchJobs will be called via the useEffect that watches hasSearched
  };
  
  // Reset filters
  const resetFilters = () => {
    setCity('');
    setCountry('');
    setMinSalary('');
    setMaxSalary('');
    setWorkType('');
    setCurrentPage(0);
    setFilteredJobs([]);
    setHasSearched(false);
    // Update total job count when resetting filters
    fetchInitialCount();
  };
  
  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    setLoading(true); // Set loading state before fetching
    // fetchJobs will be called via useEffect
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setLoading(true); // Set loading state before fetching
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setLoading(true); // Set loading state before fetching
    }
  };
  
  // Apply for a job
  const handleApplyClick = async (jobId: number) => {
    try {
      await onApplyForJob(jobId);
      
      // Find the job that was applied to
      const appliedJob = filteredJobs.find(job => job.jobId === jobId);
      if (appliedJob) {
        console.log(`Successfully applied to: ${appliedJob.title} at ${appliedJob.companyName}`);
      }
    } catch (error) {
      console.error("Error applying for job:", error);
    }
  };
  
  return (
    <div className="job-search-container">
      <h2>Find Your Dream Job</h2>
      
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="country">Country:</label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="minSalary">Min Salary:</label>
          <input
            type="number"
            id="minSalary"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            placeholder="Minimum salary"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="maxSalary">Max Salary:</label>
          <input
            type="number"
            id="maxSalary"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
            placeholder="Maximum salary"
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="workType">Work Type:</label>
          <select
            id="workType"
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
          >
            <option value="">All Types</option>
            {workTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-buttons">
          <button onClick={applyFilters} className="search-button">
            Search
          </button>
          <button onClick={resetFilters} className="reset-button">
            Reset
          </button>
        </div>
      </div>
      
      {error && <div className="error">Error: {error}</div>}
      
      {loading && (
        <div className="loading">
          {filteredJobs.length > 0 ? 'Loading more jobs...' : 'Loading jobs...'}
        </div>
      )}
      
      <div className="job-results">
        <div className="job-results-header">
          <h3>Job Results</h3>
          <div className="job-count-badge">
            {totalJobs === 0 && !hasSearched ? 
              "Calculating available positions..." : 
              `${totalJobs} jobs available ${filteredJobs.length > 0 && totalPages > 1 ? `• Page ${currentPage + 1} of ${totalPages}` : ''}`
            }
          </div>
        </div>
        
        {!loading && filteredJobs.length === 0 ? (
          hasSearched ? (
            <div className="no-results">No jobs found matching your criteria</div>
          ) : (
            <div className="intro-message">
              Use the filters above to search for jobs
            </div>
          )
        ) : (
          <>
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
                  {filteredJobs.map((job) => (
                    <React.Fragment key={job.jobId}>
                      <tr className={isJobExpanded(job.jobId) ? "job-row expanded" : "job-row"}>
                        <td className="position-col" data-label="Position">
                          <div className="job-title">{job.title}</div>
                        </td>
                        <td className="company-col" data-label="Company">{job.companyName}</td>
                        <td className="location-col" data-label="Location">{job.cityName}{job.countryName ? `, ${job.countryName}` : ''}</td>
                        <td className="salary-col" data-label="Salary">${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</td>
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
                                onClick={() => handleApplyClick(job.jobId)}
                                disabled={applyingToJob === job.jobId}
                              >
                                {applyingToJob === job.jobId ? 'Applying...' : 'Apply Now'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isJobExpanded(job.jobId) && (
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
                  
                  {/* Generate more page numbers around current page */}
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
      </div>
    </div>
  );
};

export default JobSearch; 