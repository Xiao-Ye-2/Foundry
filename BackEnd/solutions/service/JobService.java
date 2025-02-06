package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import data.JobPosting;

import java.util.List;

@Service
public class JobService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<JobPosting> searchJobs(String location, Double minSalary) {
        String sql = "SELECT * FROM JobPostings j " +
                     "JOIN Cities c ON j.city_id = c.city_id " +
                     "WHERE c.city_name = ? AND j.min_salary >= ?";
        return jdbcTemplate.queryForList(sql, new Object[]{location, minSalary}, JobPosting.class);
    }

    public String applyToJob(Long employeeId, String jobId) {
        String sql = "INSERT INTO Applications (employee_id, job_id) VALUES (?, ?)";
        try {
            jdbcTemplate.update(sql, employeeId, jobId);
            return "Application submitted!";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public String postJob(JobPosting job, Long employerId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'postJob'");
    }
}