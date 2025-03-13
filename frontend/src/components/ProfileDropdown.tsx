import React, { useState } from 'react';
import "../styles/ProfileDropdown.css";

interface UserProfile {
  userId: number | null;
  userName: string;
}


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

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const resumeUrl = URL.createObjectURL(file);
      setResumeUrl(resumeUrl);

      const url = `http://localhost:8080/api/employees/profile`;
      if (userProfile.userId !== null) {
        try {
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userProfile.userId.toString(),
            },
            body: JSON.stringify({ resumeUrl: resumeUrl }),
          });

          if (!response.ok) {
            throw new Error('Failed to update resume URL');
          }

          alert('Resume URL updated successfully');
        } catch (error) {
          console.error('Error updating resume URL:', error);
          alert('Failed to update resume URL');
        }
      }
    }
  };

  return (
    <div className="profile-dropdown">
      <p>{userRole} ID: {userProfile.userId}</p>
      <p>Name: {userProfile.userName}</p>
      <p>Role: {userRole}</p>
      <div className="skills-section">
        <h4>Skills</h4>
        <ul>
          {skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
        <input 
          type="text" 
          value={newSkill} 
          onChange={(e) => setNewSkill(e.target.value)} 
          placeholder="Add a skill" 
        />
        <button onClick={handleAddSkill}>Save</button>
      </div>
      {userRole === "employee" && 
      <div className="resume-section">
        <h4>Resume</h4>
        <input 
          type="file" 
          accept=".pdf,.doc,.docx" 
          onChange={handleResumeUpload} 
        />
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