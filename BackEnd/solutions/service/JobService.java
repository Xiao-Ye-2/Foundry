package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import data.JobPosting;
import data.JobRowMapper;

import java.util.List;
import java.util.Map;

@Service
public class JobService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private JobRowMapper jobRowMapper;

    // R6:
    public List<JobPosting> searchJobs(String location, Double minSalary, String workType) {
        String sql = "SELECT j.*, c.CompanyName, ci.CityName " +
                    "FROM JobPostings j " +
                    "JOIN Employers e ON j.EmployerId = e.UserId " +
                    "JOIN Companies c ON e.CompanyId = c.CompanyId " +
                    "JOIN Cities ci ON j.CityId = ci.CityId " +
                    "WHERE j.IsActive = 1 " +
                    "AND (?1 IS NULL OR ci.CityName = ?1) " +
                    "AND (?2 IS NULL OR j.MinSalary >= ?2) " +
                    "AND (?3 IS NULL OR j.WorkType = ?3)";
        return jdbcTemplate.query(sql, jobRowMapper, location, minSalary, workType);
    }


    // R7:
    public void applyToJob(Long employeeId, Long jobId) {
        String checkSql = "SELECT COUNT(*) FROM Applications WHERE EmployeeId = ? AND JobId = ?";
        int count = jdbcTemplate.queryForObject(checkSql, Integer.class, employeeId, jobId);

        if (count > 0) {
            throw new RuntimeException("You have already applied for this job");
        }

        String sql = "INSERT INTO Applications (EmployeeId, JobId) VALUES (?, ?)";
        jdbcTemplate.update(sql, employeeId, jobId);
    }

    // R8:
    public void postJob(JobPosting job) {
        String sql = "INSERT INTO JobPostings (EmployerId, Title, Description, MinSalary, " +
                    "MaxSalary, WorkType, CityId) VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
            job.getEmployerId(), job.getTitle(), job.getDescription(),
            job.getMinSalary(), job.getMaxSalary(), job.getWorkType(), job.getCityId());
    }

    // R9:
    public List<Map<String, Object>> getApplications(Long employerId) {
        String sql = "SELECT a.*, u.FirstName, u.LastName, j.Title " +
                    "FROM Applications a " +
                    "JOIN Users u ON a.EmployeeId = u.UserId " +
                    "JOIN JobPostings j ON a.JobId = j.JobId " +
                    "WHERE j.EmployerId = ?";
        return jdbcTemplate.queryForList(sql, employerId);
    }
}