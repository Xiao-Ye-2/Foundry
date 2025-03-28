import React, { useState, useEffect } from 'react';
import ComboBox from './ComboBox';

interface Location {
  CityName: string;
  CountryName: string;
  AvgMinSalary: number;
  AvgMaxSalary: number;
}

type Option = {
  id: number;
  label: string;
};

const analysisOptions: Option[] = [
  { id: 1, label: 'Location' },
  { id: 2, label: 'Company' }
];

const metricsOptions: Option[] = [
  { id: 1, label: 'Minimum Salary' },
  { id: 2, label: 'Maximum Salary' }
];

const Analysis: React.FC = () => {
  const [filter, setFilter] = useState<string>('');
  const [salaryMetric, setSalaryMetric] = useState<string>('');
  const [statistics, setStatistics] = useState<Location[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const rowsPerPage = 10;

  const handleFilterChange = (label: string) => {
    setFilter(label);
  };

  const handleMetricChange = (label: string) => {
    setSalaryMetric(label);
    setCurrentPage(0);  // Reset to first page when metric changes
  };
  
  useEffect(() => {
    const fetchStatistics = async () => {
      if (filter === 'Location' && (salaryMetric === 'Minimum Salary' || salaryMetric === 'Maximum Salary')) {
        setIsLoading(true);
        try {
          let url = '';
          if (salaryMetric === 'Minimum Salary') {
            url = 'http://localhost:8080/api/jobs/statistics/location/minsalary';
          } else {
            url = 'http://localhost:8080/api/jobs/statistics/location/maxsalary';
          }
          console.log(`Fetching avgSalary in location from: ${url}`);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            credentials: 'omit'
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch avgSalary in location: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          setStatistics(data);
          console.log('AvgSalary in location:', JSON.stringify(data, null, 2));
        } catch (error) {
          console.error('Error fetching avgSalary in location:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStatistics();
  }, [salaryMetric]);

  const handleNextPage = () => {
    if ((currentPage + 1) * rowsPerPage < statistics.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCurrentPageData = () => {
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    return statistics.slice(start, end);
  };

  return (
    <div className="job-search-container">
      <h2>Analyze trending jobs</h2>
      <div className="filters-container" >
        <div className="filter-group">
          <label htmlFor="location">Analyze on:</label>
          <ComboBox
            options={analysisOptions}
            value={filter}
            onChange={handleFilterChange}
            placeholder="Select analysis type"
          />
        </div>

        {filter === 'Location' && (
        <div className="filter-group">
          <label htmlFor="metrics">Metrics:</label>
          <ComboBox
            options={metricsOptions}
            value={salaryMetric}
            onChange={handleMetricChange}
            placeholder="Choose an option"
          />
        </div>
      )}
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : statistics.length > 0 && filter === 'Location' && (
        <div className="statistics-container">
          <h3>Statistics Results</h3>
          <table className="statistics-table">
            <thead>
              <tr>
                <th>City</th>
                <th>Country</th>
                <th>Salary(k)</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPageData().map((location, index) => (
                <tr key={currentPage * rowsPerPage + index}>
                  <td>{location.CityName}</td>
                  <td>{location.CountryName}</td>
                  <td>${salaryMetric === 'Minimum Salary'
                    ? location.AvgMinSalary?.toLocaleString()
                    : location.AvgMaxSalary?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-controls">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 0}
              className="pagination-button"
            >
              Previous 10
            </button>
            <span className="page-info">
              Page {currentPage + 1} of {Math.ceil(statistics.length / rowsPerPage)}
            </span>
            <button 
              onClick={handleNextPage}
              disabled={(currentPage + 1) * rowsPerPage >= statistics.length}
              className="pagination-button"
            >
              Next 10
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
