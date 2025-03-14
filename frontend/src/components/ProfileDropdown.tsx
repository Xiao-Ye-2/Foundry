import React, { useState } from 'react';
import "../styles/ProfileDropdown.css";
import { UserProfile } from "../types";

interface EmployeeDropdownProps {
  userProfile: UserProfile;
  userRole: 'employee' | 'employer';
}

const EmployeeDropdown: React.FC<EmployeeDropdownProps> = ({ userProfile, userRole }) => {
  const [resumeUrl, setResumeUrl] = useState<string>(userProfile.resumeUrl || '');
  const [isSaved, setIsSaved] = useState<boolean>(false); // Track save status

  const handleResumeUrlUpdate = async () => {
    const url = `http://localhost:8080/api/employees/profile`;
    if (userProfile.userId !== null) {
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'user-id': userProfile.userId.toString(),
          },
          body: JSON.stringify({
            resumeUrl: resumeUrl,
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || 'Failed to update resume URL');
        }

        setIsSaved(true); // Set save status to true
        setTimeout(() => setIsSaved(false), 3000); // Reset save status after 3 seconds
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
        <button 
          onClick={handleResumeUrlUpdate} 
          className={isSaved ? 'saved-button' : ''}
        >
          {isSaved ? (
            <>
              Saved <span className="checkmark">✔</span>
            </>
          ) : (
            'Save Resume URL'
          )}
        </button>
        {resumeUrl && (
          <div className="resume-link">
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
          </div>
        )}
      </div>}
      {userRole === "employer" && <p>Company: {userProfile.companyName}</p>}
    </div>
  );
};

export default EmployeeDropdown;