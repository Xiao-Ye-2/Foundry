import React, { useState } from "react";
import { UserProfile } from "../types"; 

interface PostJobFormProps {
  userProfile: UserProfile; 
  onSubmit: (jobData: {
    jobId: number;
    title: string;
    description: string;
    minSalary: number;
    maxSalary: number;
    workType: string;
    cityName: string;
    countryName: string;
  }) => void;
}

const PostJobForm: React.FC<PostJobFormProps> = ({ userProfile, onSubmit }) => {
  const [jobId, setJobId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minSalary, setMinSalary] = useState<number | "">("");
  const [maxSalary, setMaxSalary] = useState<number | "">("");
  const [workType, setWorkType] = useState("Full-time");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!jobId || !title || !description || !minSalary || !maxSalary) {
      alert("Please fill out all fields.");
      return;
    }

    if (!userProfile.cityName || !userProfile.countryName) {
      alert("Your profile is missing city or country information.");
      return;
    }

    onSubmit({
      jobId: Number(jobId),
      title,
      description,
      minSalary: Number(minSalary),
      maxSalary: Number(maxSalary),
      workType,
      cityName: userProfile.cityName,
      countryName: userProfile.countryName, 
    });

    setJobId("");
    setTitle("");
    setDescription("");
    setMinSalary("");
    setMaxSalary("");
    setWorkType("Full-time");
  };

  return (
    <form className="post-job-form" onSubmit={handleSubmit}>
      <h2>Post a Job</h2>

      <label>Job ID:</label>
      <input type="number" value={jobId} onChange={(e) => setJobId(e.target.valueAsNumber || "")} required />

      <label>Title:</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>Description:</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

      <label>Min Salary:</label>
      <input type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.valueAsNumber || "")} required />

      <label>Max Salary:</label>
      <input type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.valueAsNumber || "")} required />

      <label>Work Type:</label>
      <select value={workType} onChange={(e) => setWorkType(e.target.value)}>
        <option value="Full-time">Full-time</option>
        <option value="Part-time">Part-time</option>
        <option value="Contract">Contract</option>
        <option value="Intern">Intern</option>
      </select>

      <label>City:</label>
      <input type="text" value={userProfile.cityName || ""} disabled />

      <label>Country:</label>
      <input type="text" value={userProfile.countryName || ""} disabled />

      <button type="submit">Post Job</button>
    </form>
  );
};

export default PostJobForm;
