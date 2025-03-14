import React, { useState } from 'react';
import "../styles/ProfileDropdown.css";
import { UserProfile } from "../types";

interface EmployeeDropdownProps {
  userProfile: UserProfile;
  userRole: 'employee' | 'employer';
}

const EmployeeDropdown: React.FC<EmployeeDropdownProps> = ({ userProfile, userRole }) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>("");
  const [resumeUrl, setResumeUrl] = useState<string>("");

  const handleAddSkill = () => {
    if (newSkill.trim() !== "") {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleResumeUrlUpdate = async () => {
    const url = `http://localhost:8080/api/employees/profile`; // Backend endpoint
    if (userProfile.userId !== null) {
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userProfile.userId.toString(), // Pass employeeId in the header
          },
          body: JSON.stringify({
            resumeUrl: resumeUrl, // Only pass the resume URL in the body
          }),
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || 'Failed to update resume URL');
        }
  
        alert('Resume URL updated successfully');
      } catch (error: any) {
        console.error('Error updating resume URL:', error);
        alert(error.message || 'Failed to update resume URL');
      }
    } else {
      alert('User ID is missing. Unable to update resume URL.');
    }
  };

  return (
    <div className="profile-dropdown">
      <p>{userRole} ID: {userProfile.userId}</p>
      <p>Name: {userProfile.userName}</p>
      <p>Role: {userRole}</p>
      <p>Location: {userProfile.cityName}, {userProfile.countryName}</p>
      {userRole === "employee" && 
      <div className="resume-section">
        <h4>Resume</h4>
        <input 
          type="text" 
          value={resumeUrl} 
          onChange={(e) => setResumeUrl(e.target.value)} 
          placeholder="Paste your resume URL" 
        />
        <button onClick={handleResumeUrlUpdate}>Save Resume URL</button>
        {resumeUrl && (
          <div className="resume-link">
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
          </div>
        )}
      </div>}
    </div>
  );
};

export default EmployeeDropdown;