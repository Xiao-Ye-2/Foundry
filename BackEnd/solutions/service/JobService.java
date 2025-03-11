package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import data.JobPosting;
import data.JobRowMapper;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class JobService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private JobRowMapper jobRowMapper;

    // R6: Job search with filters
    public List<JobPosting> searchJobs(String city, String country, Double minSalary, Double maxSalary, 
                                     String workType, Integer limit, Integer offset) {
        StringBuilder sql = new StringBuilder(
            "SELECT j.*, c.CompanyName, ci.CityName, co.CountryName " +
            "FROM JobPostings j " +
            "JOIN Employers e ON j.EmployerId = e.UserId " +
            "JOIN Companies c ON e.CompanyId = c.CompanyId " +
            "JOIN Cities ci ON j.CityId = ci.CityId " +
            "JOIN Countries co ON ci.CountryId = co.CountryId " +
            "WHERE j.IsActive = 1 " +
            "AND (?1 IS NULL OR ci.CityName LIKE ?1) " +
            "AND (?2 IS NULL OR co.CountryName LIKE ?2) " +
            "AND (?3 IS NULL OR j.MinSalary >= ?3) " +
            "AND (?4 IS NULL OR j.MaxSalary <= ?4) " +
            "AND (?5 IS NULL OR j.WorkType = ?5) " +
            "ORDER BY j.PostDate DESC"
        );

        // Only add LIMIT and OFFSET if they are provided
        if (limit != null) sql.append(" LIMIT ?6");
        if (offset != null) sql.append(" OFFSET ?7");

        // Prepare parameters with wildcards for text searches
        String cityParam = city != null ? "%" + city + "%" : null;
        String countryParam = country != null ? "%" + country + "%" : null;

        // Create a list of parameters to pass to the query
        List<Object> params = new ArrayList<>();
        params.add(cityParam);
        params.add(countryParam);
        params.add(minSalary);
        params.add(maxSalary);
        params.add(workType);

        if (limit != null) params.add(limit);
        if (offset != null) params.add(offset);

        return jdbcTemplate.query(sql.toString(), jobRowMapper, params.toArray());
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

    // Get all active jobs
    public List<JobPosting> getAllJobs() {
        try {
            // First, let's check if the table exists and has data
            String checkSql = "SELECT COUNT(*) FROM JobPostings";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class);
            System.out.println("Found " + count + " jobs in database");

            String sql = "SELECT j.JobId, j.Title, j.Description, " +
                        "j.MinSalary, j.MaxSalary, j.WorkType, " +
                        "j.IsActive, j.PostDate, j.EmployerId, " +
                        "c.CompanyName as CompanyName, " +
                        "ci.CityName as CityName, " +
                        "co.CountryName as CountryName " +
                        "FROM JobPostings j " +
                        "LEFT JOIN Employers e ON j.EmployerId = e.UserId " +
                        "LEFT JOIN Companies c ON e.CompanyId = c.CompanyId " +
                        "LEFT JOIN Cities ci ON j.CityId = ci.CityId " +
                        "LEFT JOIN Countries co ON ci.CountryId = co.CountryId " +
                        "WHERE j.IsActive = 1 " +
                        "ORDER BY j.PostDate DESC " +
                        "LIMIT 500";

            System.out.println("Executing query: " + sql);
            List<JobPosting> jobs = jdbcTemplate.query(sql, jobRowMapper);
            System.out.println("Query executed successfully, found " + jobs.size() + " jobs");
            return jobs;
        } catch (Exception e) {
            throw new RuntimeException("Database error: " + e.getMessage(), e);
        }
    }

    // Get applications by employee ID
    public List<Map<String, Object>> getApplicationsByEmployeeId(Long employeeId) {
        String sql = "SELECT a.*, j.Title as JobTitle, c.CompanyName " +
                    "FROM Applications a " +
                    "JOIN JobPostings j ON a.JobId = j.JobId " +
                    "JOIN Employers e ON j.EmployerId = e.UserId " +
                    "JOIN Companies c ON e.CompanyId = c.CompanyId " +
                    "WHERE a.EmployeeId = ?";
        return jdbcTemplate.queryForList(sql, employeeId);
    }
}