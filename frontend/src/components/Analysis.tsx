import React, { useState, useEffect } from 'react';
import ComboBox from './ComboBox';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
interface StatisticData {
  // Location data fields
  CityName?: string;
  CountryName?: string;
  AvgSalary?: number;
  
  // Shortlist ratio fields
  JobId?: number;
  JobTitle?: string;
  TotalSL?: number;
  TotalApp?: number;
  ShortlistToApplicationRatio?: number | null;
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

type Option = {
  id: number;
  label: string;
};

const analysisOptions: Option[] = [
  { id: 1, label: 'Location' },
  { id: 2, label: 'Company' },
  { id: 3, label: 'Location Stats' }, // New option for location stats
  { id: 4, label: 'Company Stats' } // New option for Company stats
]
const metricsOptions: Option[] = [
  { id: 1, label: 'Minimum Salary' },
  { id: 2, label: 'Maximum Salary' }
];

const analysisOptionsEmployer: Option[] = [
  { id: 1, label: 'Shortlist-Application Ratio' },
];
interface AnalysisProps {
  userRole: 'employee' | 'employer';
  userId ?: number | null;
}

const Analysis: React.FC<AnalysisProps> = ({ userRole, userId }) => {
  const [filter, setFilter] = useState<string>('');
  const [salaryMetric, setSalaryMetric] = useState<string>('');
  const [statistics, setStatistics] = useState<StatisticData[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);  const [currentPage, setCurrentPage] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const rowsPerPage = 10;

  const [barStats, setBarStats] = useState<any | null>(null);

  const handleFilterChange = (label: string) => {
    setFilter(label);
  };

  const handleMetricChange = (label: string) => {
    setSalaryMetric(label);
    setCurrentPage(0);  // Reset to first page when metric changes
  };
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/locations');
        if (!response.ok) {
          throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (filter === 'Company Stats') {
      const fetchCompanies = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/companies');
          if (!response.ok) {
            throw new Error(`Failed to fetch companies: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          setCompanies(data);
        } catch (error) {
          console.error('Error fetching companies:', error);
        }
      };

      fetchCompanies();
    }
  }, [filter]);

  const handleLocationChange = (_: string, cityId: number) => {
    setSelectedCityId(cityId);
  };

  const handleCompanyChange = (_: string, companyId: number) => {
    setSelectedCompanyId(companyId);
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
      } else if (filter === 'Shortlist-Application Ratio') {
        setIsLoading(true);
        try {
          const url = `http://localhost:8080/api/jobs/statistics/shortlist-ratio/employer/${userId}`;
          console.log(`Fetching shortlist ratio stats from: ${url}`);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              // Optionally pass employer info here if your backend needs it
            },
            credentials: 'omit'
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch shortlist ratio stats: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          setStatistics(data);
          console.log('Shortlist ratio stats:', JSON.stringify(data, null, 2));
        } catch (error) {
          console.error('Error fetching shortlist ratio stats:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (filter === 'Location Stats' && selectedCityId) {
        setIsLoading(true);
        try {
          const url = `http://localhost:8080/api/jobs/statistics/location/${selectedCityId}`;
          console.log(`Fetching location stats from: ${url}`);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            credentials: 'omit'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch location stats: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          setBarStats(data);
          console.log('Location stats:', JSON.stringify(data, null, 2));
        } catch (error) {
          console.error('Error fetching location stats:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (filter === 'Company Stats' && selectedCompanyId) {
        setIsLoading(true);
        try {
          const url = `http://localhost:8080/api/jobs/statistics/company/${selectedCompanyId}`;
          console.log(`Fetching company stats from: ${url}`);
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            credentials: 'omit'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch company stats: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          setBarStats(data);
          console.log('Company stats:', JSON.stringify(data, null, 2));
        } catch (error) {
          console.error('Error fetching company stats:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log(filter);
      }
    };

    fetchStatistics();
  }, [salaryMetric, filter, userId, selectedCityId, selectedCompanyId]);

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

  // Render the bar charts for location stats
  const renderStatsCharts = () => {
    if (!barStats) return null;
    
    // Determine chart config based on the active filter
    let firstChartTitle = 'Average Metrics';
    let secondChartTitle = 'Top 10% Metrics'; 
    let firstDataKey = 'averages';
    let secondDataKey = 'top_10_percent';
    
    // For company stats, use different keys if needed
    if (filter === 'Company Stats') {
      firstDataKey = barStats.company_averages ? 'company_averages' : 'averages';
      secondDataKey = barStats.industry_top_10_percent ? 'industry_top_10_percent' : 'top_10_percent';
      firstChartTitle = 'Company Metrics';
      secondChartTitle = 'Industry Top 10%';
    }
    
    // Create datasets from the data
    const firstChartData = {
      labels: ['Apply', 'Dislike', 'Shortlist'],
      datasets: [
        {
          label: filter === 'Location Stats' ? 'Average Counts' : 'Company Counts',
          data: [
            barStats[firstDataKey]?.avg_apply ?? 0, 
            barStats[firstDataKey]?.avg_dislike ?? 0, 
            barStats[firstDataKey]?.avg_shortlist ?? 0
          ],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
    
    const secondChartData = {
      labels: ['Apply', 'Dislike', 'Shortlist'],
      datasets: [
        {
          label: 'Top 10% Performers',
          data: [
            barStats[secondDataKey]?.top_apply ?? 0, 
            barStats[secondDataKey]?.top_dislike ?? 0, 
            barStats[secondDataKey]?.top_shortlist ?? 0
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: filter === 'Location Stats' ? 'Location Statistics' : 'Company Performance',
        },
      },
    };
    
    return (
      <div className="chart-container">
        <div className="chart-wrapper">
          <h4>{firstChartTitle}</h4>
          <div style={{ height: '300px' }}>
            <Bar options={options} data={firstChartData} />
          </div>
        </div>
        
        <div className="chart-wrapper">
          <h4>{secondChartTitle}</h4>
          <div style={{ height: '300px' }}>
            <Bar options={options} data={secondChartData} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="job-search-container">
      <h2>Analyze trending jobs</h2>
      <div className="filters-container" >
        <div className="filter-group">
          <label htmlFor="location">Analyze on:</label>
          <ComboBox
            options={userRole === 'employee' ? analysisOptions : analysisOptionsEmployer}
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

        {filter === 'Location Stats' && (
          <div className="filter-group">
            <label htmlFor="location">Select City:</label>
            <ComboBox
              options={locations.map(loc => ({
                id: loc.cityId,
                label: `${loc.cityName}, ${loc.countryName}`
              }))}
              value={selectedCityId ? locations.find(l => l.cityId === selectedCityId)?.cityName || '' : ''}
              onChange={handleLocationChange}
              placeholder="Search for a location"
            />
          </div>
        )}

        {filter === 'Company Stats' && (
          <div className="filter-group">
            <label htmlFor="company">Select Company:</label>
            <ComboBox
              options={companies.map(company => ({
                id: company.companyId,
                label: company.companyName
              }))}
              value={selectedCompanyId ? companies.find(c => c.companyId === selectedCompanyId)?.companyName || '' : ''}
              onChange={handleCompanyChange}
              placeholder="Search for a company"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Display charts when Location Stats filter is selected and data is available */}
          {(filter === 'Location Stats' || filter === 'Company Stats') && barStats ? (
            renderStatsCharts()
          ) : (
            /* Display table for other filters when data is available */
            
            statistics.length > 0 && (
              <div className="statistics-container">
                <h3>Statistics Results</h3>
                <table className="statistics-table">
                  <thead>
                    <tr>
                      {filter === 'Location' ? (
                        <>
                          <th>City</th>
                          <th>Country</th>
                          <th>Salary(k) (ranked from high to low)</th>
                        </>
                      ) : filter === 'Shortlist-Application Ratio' ? (
                        <>
                          <th>Job ID</th>
                          <th>Job Title</th>
                          <th>Shortlisted</th>
                          <th>Applications</th>
                          <th>Shortlist Ratio</th>
                        </>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                  {getCurrentPageData().map((item, index) => (
                      <tr key={currentPage * rowsPerPage + index}>
                        {filter === 'Location' ? (
                          <>
                            <td>{item.CityName}</td>
                            <td>{item.CountryName}</td>
                            <td>${item.AvgSalary?.toLocaleString()}</td>
                          </>
                        ) : filter === 'Shortlist-Application Ratio' ? (
                          <>
                            <td>{item.JobId}</td>
                            <td>{item.JobTitle}</td>
                            <td>{item.TotalSL}</td>
                            <td>{item.TotalApp}</td>
                            <td>
                              {(item.ShortlistToApplicationRatio !== null && item.ShortlistToApplicationRatio !== undefined) 
                                ? `${(item.ShortlistToApplicationRatio * 100).toFixed(1)}%` 
                                : 'N/A'}
                            </td>
                          </>
                        ) : null}
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
            )
          )}
        </>
      )}
    </div>
  );
};

export default Analysis;
