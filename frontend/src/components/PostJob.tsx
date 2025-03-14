import React, { useState, useEffect } from 'react';
import ComboBox from './ComboBox';
import { UserProfile } from '../types';

interface Location {
  cityId: number;
  cityName: string;
  countryName: string;
}

interface PostJobProps {
  userProfile: UserProfile;
  onSubmit: (jobData: any) => void;
}

const PostJob: React.FC<PostJobProps> = ({ userProfile, onSubmit }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cityId: '',
    minSalary: '',
    maxSalary: '',
    workType: '',
    requirements: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch locations when component mounts
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/locations');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError('Failed to load locations');
      }
    };

    fetchLocations();
  }, []);

  const handleLocationChange = (label: string, cityId: number) => {
    setFormData(prev => ({
      ...prev,
      cityId: cityId.toString()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        cityId: parseInt(formData.cityId),
        minSalary: parseFloat(formData.minSalary),
        maxSalary: parseFloat(formData.maxSalary),
        workType: formData.workType,
        requirements: formData.requirements
      };

      await onSubmit(jobData);

      // Clear form after successful submission
      setFormData({
        title: '',
        description: '',
        cityId: '',
        minSalary: '',
        maxSalary: '',
        workType: '',
        requirements: '',
      });

    } catch (error) {
      setError('Failed to post job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <h1 className="post-job-title">Post a New Job</h1>

      <form className="post-job-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Job Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
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

        <div className="form-group">
          <label htmlFor="workType">Work Type:</label>
          <select
            id="workType"
            name="workType"
            value={formData.workType}
            onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
            required
          >
            <option value="">Select Work Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="minSalary">Minimum Salary:</label>
          <input
            type="number"
            id="minSalary"
            name="minSalary"
            value={formData.minSalary}
            onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxSalary">Maximum Salary:</label>
          <input
            type="number"
            id="maxSalary"
            name="maxSalary"
            value={formData.maxSalary}
            onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={5}
          />
        </div>

        <div className="form-group">
          <label htmlFor="requirements">Requirements:</label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            required
            rows={5}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;