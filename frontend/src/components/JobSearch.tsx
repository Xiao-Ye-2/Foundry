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

const JobSearch: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Fetch all jobs initially
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/jobs', {
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
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (country) params.append('country', country);
      if (minSalary) params.append('minSalary', minSalary);
      if (maxSalary) params.append('maxSalary', maxSalary);
      if (workType) params.append('workType', workType);
      
      const url = `http://localhost:8080/api/jobs/search?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filtered jobs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setFilteredJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setCity('');
    setCountry('');
    setMinSalary('');
    setMaxSalary('');
    setWorkType('');
    setFilteredJobs(jobs);
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
      
      {loading && <div className="loading">Loading jobs...</div>}
      {error && <div className="error">Error: {error}</div>}
      
      <div className="job-results">
        <h3>Job Results ({filteredJobs.length})</h3>
        
        {filteredJobs.length === 0 && !loading ? (
          <div className="no-results">No jobs found matching your criteria</div>
        ) : (
          <div className="job-list">
            {filteredJobs.map((job) => (
              <div key={job.jobId} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <h4>{job.companyName}</h4>
                </div>
                
                <div className="job-details">
                  <p><strong>Location:</strong> {job.cityName}{job.countryName ? `, ${job.countryName}` : ''}</p>
                  <p><strong>Salary:</strong> ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}</p>
                  <p><strong>Work Type:</strong> {job.workType}</p>
                </div>
                
                {isJobExpanded(job.jobId) && (
                  <div className="job-expanded-details">
                    <p className="job-description">{job.description}</p>
                  </div>
                )}
                
                <div className="job-card-actions">
                  <button 
                    className="details-button" 
                    onClick={() => toggleJobDetails(job.jobId)}
                  >
                    {isJobExpanded(job.jobId) ? 'Hide Details' : 'Show Details'}
                  </button>
                  <button className="apply-button">Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSearch; 