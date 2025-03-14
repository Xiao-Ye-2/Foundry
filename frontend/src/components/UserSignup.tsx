import React, { useState, useEffect } from 'react';
import '../styles/UserSignup.css';
import ComboBox from './ComboBox';

interface Company {
  companyId: number;
  companyName: string;
}

interface Location {
  cityId: number;
  cityName: string;
  countryName: string;
}

interface UserSignupProps {
  onSignup: () => void;
  onBack: () => void;
  userRole: 'employee' | 'employer';
}

const UserSignup: React.FC<UserSignupProps> = ({ onSignup, onBack, userRole }) => {
  const [formData, setFormData] = useState({
    userName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    cityId: '',
    companyId: '', // Only used for employer
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [locationSearch, setLocationSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  // Fetch companies and locations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch locations
        const locationsResponse = await fetch('http://localhost:8080/api/locations');
        const locationsData = await locationsResponse.json();
        setLocations(locationsData);

        // Only fetch companies if user is employer
        if (userRole === 'employer') {
          const companiesResponse = await fetch('http://localhost:8080/api/companies');
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load necessary data. Please try again.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [userRole]);

  // Filter locations based on search
  const filteredLocations = locations.filter(location => {
    const searchTerm = locationSearch.toLowerCase();
    return location.cityName.toLowerCase().includes(searchTerm) ||
           location.countryName.toLowerCase().includes(searchTerm);
  });

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // For employer, validate company selection
    if (userRole === 'employer' && !formData.companyId) {
      setError('Please select a company');
      return;
    }

    // Validate location selection
    if (!formData.cityId) {
      setError('Please select a location');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: userRole,
          passwordHash: formData.password,
          ...(userRole === 'employer' ? { companyId: parseInt(formData.companyId) } : {})
        }),
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        if (!response.ok) {
          throw new Error(responseText);
        }
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to sign up. Please try again.');
      }

      onSignup();
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleLocationChange = (label: string, cityId: number) => {
    setFormData(prev => ({
      ...prev,
      cityId: cityId.toString()
    }));
  };

  const handleCompanyChange = (label: string, companyId: number) => {
    setFormData(prev => ({
      ...prev,
      companyId: companyId.toString()
    }));
  };

  if (isLoadingData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-signup-container">
      <h1 className="signup-title">
        {userRole === 'employee' ? 'Employee Sign Up' : 'Employer Sign Up'}
      </h1>

      <form className="signup-form" onSubmit={handleSubmit}>
        {error && (
          <div className="signup-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="userName">Full Name:</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <ComboBox
            options={locations.map(loc => ({
              id: loc.cityId,
              label: `${loc.countryName} - ${loc.cityName}`
            }))}
            value={formData.cityId ? locations.find(l => l.cityId.toString() === formData.cityId)?.cityName || '' : ''}
            onChange={handleLocationChange}
            placeholder="Search for a location"
            disabled={isLoading}
          />
        </div>

        {userRole === 'employer' && (
          <div className="form-group">
            <label htmlFor="company">Company:</label>
            <ComboBox
              options={companies.map(comp => ({
                id: comp.companyId,
                label: comp.companyName
              }))}
              value={formData.companyId ? companies.find(c => c.companyId.toString() === formData.companyId)?.companyName || '' : ''}
              onChange={handleCompanyChange}
              placeholder="Search for a company"
              disabled={isLoading}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
            disabled={isLoading}
          />
        </div>

        <div className="signup-actions">
          <button
            type="button"
            className="back-button"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className="signup-button"
            disabled={isLoading || isLoadingData}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSignup;