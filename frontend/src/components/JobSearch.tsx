import React, { useState, useEffect } from 'react';
import '../styles/JobSearch.css';
import ComboBox from './ComboBox';
import JobRecommendations from './JobRecommendations';
import JobTable from './JobTable';

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

interface Location {
  cityId: number;
  cityName: string;
  countryName: string;
}

interface Company {
  companyId: number;
  companyName: string;
}

interface JobSearchProps {
  employeeId: number | null;
  onApplyForJob: (jobId: number) => Promise<void>;
  hasAppliedForJob: (jobId: number) => boolean;
  applyingToJob: number | null;
}

const JobSearch: React.FC<JobSearchProps> = ({ 
  employeeId,
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
  
  // Filter states and references
  const [cityId, setCityId] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [minSalary, setMinSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [workType, setWorkType] = useState<string>('');
  
  // Data for dropdowns
  const [locations, setLocations] = useState<Location[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Display values for combo boxes
  const [locationDisplay, setLocationDisplay] = useState<string>('');
  const [companyDisplay, setCompanyDisplay] = useState<string>('');
  
  // Work type options based on database schema constraints
  const workTypes = ['Full-time', 'Part-time', 'Contract', 'Intern'];
  
  // State for expanded job cards
  const [expandedJobIds, setExpandedJobIds] = useState<number[]>([]);
  
  // Added state to track if a search has been performed
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  
  // Track shortlisted jobs
  const [shortlistedJobs, setShortlistedJobs] = useState<number[]>([]);
  const [shortlistingJob, setShortlistingJob] = useState<number | null>(null);
  
  // Only keep track of the job being disliked (for UI purposes)
  const [dislikingJob, setDislikingJob] = useState<number | null>(null);
  
  // Update state for recommended jobs to track multiple job IDs
  const [recommendedJobIds, setRecommendedJobIds] = useState<number[]>([]);
  
  // Fetch locations when component mounts
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        } else {
          console.error('Failed to fetch locations');
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
  }, []);
  
  // Fetch companies when component mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        } else {
          console.error('Failed to fetch companies');
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    
    fetchCompanies();
  }, []);
  
  // Toggle job details expansion
  const toggleJobDetails = (jobId: number) => {
    // If recommendations are showing for this job, hide them first
    if (recommendedJobIds.includes(jobId)) {
      setRecommendedJobIds(prevIds => prevIds.filter(id => id !== jobId));
    }
    
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
  }, [cityId, companyId, minSalary, maxSalary, workType]);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalJobs / pageSize);
  
  // Handle location selection
  const handleLocationChange = (label: string, id: number) => {
    setLocationDisplay(label);
    setCityId(id ? id.toString() : '');
  };
  
  // Handle company selection
  const handleCompanyChange = (label: string, id: number) => {
    setCompanyDisplay(label);
    setCompanyId(id ? id.toString() : '');
  };
  
  // Fetch total job count
  const fetchTotalCount = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (cityId) params.append('cityId', cityId);
      if (companyId) params.append('companyId', companyId);
      if (minSalary) params.append('minSalary', minSalary);
      if (maxSalary) params.append('maxSalary', maxSalary);
      if (workType) params.append('workType', workType);
      
      // Include userId (employeeId) to filter out disliked jobs
      if (employeeId) params.append('userId', employeeId.toString());
      
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
      if (cityId) params.append('cityId', cityId);
      if (companyId) params.append('companyId', companyId);
      if (minSalary) params.append('minSalary', minSalary);
      if (maxSalary) params.append('maxSalary', maxSalary);
      if (workType) params.append('workType', workType);
      
      // Include userId (employeeId) to filter out disliked jobs
      if (employeeId) params.append('userId', employeeId.toString());
      
      // Always include pagination parameters
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      // Determine which endpoint to use
      const baseUrl = 'http://localhost:8080/api/jobs';
      const url = (cityId || companyId || minSalary || maxSalary || workType) 
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
      // Include userId parameter if available
      const params = new URLSearchParams();
      if (employeeId) params.append('userId', employeeId.toString());
      
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
      console.log(`Initial total job count: ${count}`);
      setTotalJobs(count);
    } catch (err) {
      console.error('Error fetching initial job count:', err);
    }
  };
  
  // Fetch initial total count on component mount and when employeeId changes
  useEffect(() => {
    fetchInitialCount();
  }, [employeeId]);

  // Fetch jobs only when search is performed or page is changed
  useEffect(() => {
    if (hasSearched) {
      fetchJobs(currentPage);
    }
  }, [currentPage, hasSearched, cityId, companyId, minSalary, maxSalary, workType]);
  
  // Add effect to scroll to top when loading finishes after page change
  useEffect(() => {
    if (!loading && hasSearched && filteredJobs.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [loading, hasSearched, filteredJobs.length]);
  
  // Apply filters
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    setHasSearched(true);
    // fetchJobs will be called via the useEffect that watches hasSearched
  };
  
  // Reset filters
  const resetFilters = () => {
    console.log('Resetting all filters');
    
    // Reset IDs first
    setCityId('');
    setCompanyId('');
    
    // Reset display values
    setLocationDisplay('');
    setCompanyDisplay('');
    
    // Reset other filters
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
        
        // Force re-render by creating a new array with the same jobs
        // This ensures the hasAppliedForJob check will be run again
        setFilteredJobs([...filteredJobs]);
      }
    } catch (error) {
      console.error("Error applying for job:", error);
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
      // If we're showing job details, close them
      if (expandedJobIds.includes(jobId)) {
        setExpandedJobIds(prevIds => prevIds.filter(id => id !== jobId));
      }
      
      // Set the job ID for recommendations
      setRecommendedJobIds(prevIds => [...prevIds, jobId]);
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
      }
    } catch (error) {
      console.error('Error toggling job shortlist:', error);
    } finally {
      setShortlistingJob(null);
    }
  };
  
  // Check if a job is shortlisted
  const isJobShortlisted = (jobId: number) => shortlistedJobs.includes(jobId);
  
  // Fetch shortlisted jobs when component mounts if employeeId exists
  useEffect(() => {
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
    
    fetchShortlistedJobs();
  }, [employeeId]);
  
  // Handle Dislike click - simplified version
  const handleDislikeClick = async (jobId: number) => {
    if (!employeeId) {
      alert('Please log in to hide jobs');
      return;
    }

    setDislikingJob(jobId);
    
    try {
      // Always send a POST request to dislike the job
      // We don't need to track disliked jobs in the frontend
      await fetch(`http://localhost:8080/api/jobs/dislike?employeeId=${employeeId}&jobId=${jobId}`, {
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
      
      // If this job is expanded, collapse it
      if (expandedJobIds.includes(jobId)) {
        setExpandedJobIds(prevIds => prevIds.filter(id => id !== jobId));
      }
      
      // Remove the job from the displayed list after a slight delay
      setTimeout(() => {
        setFilteredJobs(prevJobs => prevJobs.filter(job => job.jobId !== jobId));
      }, 500);
    } catch (error) {
      console.error('Error disliking job:', error);
    } finally {
      setDislikingJob(null);
    }
  };
  
  return (
    <div className="job-search-container">
      <h2>Find Your Dream Job</h2>
      
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="location">Location:</label>
          <ComboBox
            options={locations.map(loc => ({
              id: loc.cityId,
              label: `${loc.cityName}, ${loc.countryName}`
            }))}
            value={locationDisplay}
            onChange={handleLocationChange}
            placeholder="Search for a location"
            disabled={loading}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="company">Company:</label>
          <ComboBox
            options={companies.map(comp => ({
              id: comp.companyId,
              label: comp.companyName
            }))}
            value={companyDisplay}
            onChange={handleCompanyChange}
            placeholder="Search for a company"
            disabled={loading}
          />
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
      
      {loading && filteredJobs.length === 0 && (
        <div className="loading">Loading jobs...</div>
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
          <JobTable
            jobs={filteredJobs}
            loading={loading && filteredJobs.length > 0}
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
            onApplyForJob={handleApplyClick}
            onShortlistJob={handleShortlistClick}
            onDislikeJob={handleDislikeClick}
            onRecommendJob={toggleJobRecommendations}
            goToPage={goToPage}
            goToPreviousPage={goToPreviousPage}
            goToNextPage={goToNextPage}
            hasAppliedForJob={hasAppliedForJob}
            isJobShortlisted={isJobShortlisted}
            isJobExpanded={isJobExpanded}
            showRefreshButton={false}
            renderJobRecommendations={(jobId) => (
              <JobRecommendations
                employeeId={employeeId}
                jobId={jobId}
                onClose={() => setRecommendedJobIds(prev => prev.filter(id => id !== jobId))}
                onApplyForJob={onApplyForJob}
                hasAppliedForJob={hasAppliedForJob}
                applyingToJob={applyingToJob}
                onShortlistToggle={handleShortlistClick}
                isJobShortlisted={isJobShortlisted}
                shortlistingJob={shortlistingJob}
                inline={true}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

export default JobSearch; 