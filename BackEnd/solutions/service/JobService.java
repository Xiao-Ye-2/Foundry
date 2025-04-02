package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import data.JobPosting;
import data.mapper.JobRowMapper;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;


@Service
public class JobService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private JobRowMapper jobRowMapper;

    public List<JobPosting> searchJobs(Long cityId, Long companyId, Double minSalary, Double maxSalary,
                                     String workType, Integer limit, Integer offset, Long userId) {
        StringBuilder sql = new StringBuilder(
            "WITH application_count AS ( " +
            "    SELECT JobId, COUNT(*) AS apply_count " +
            "    FROM Applications " +
            "    GROUP BY JobId " +
            "), " +
            "dislike_count AS ( " +
            "    SELECT JobId, COUNT(*) AS dislike_count " +
            "    FROM Dislike " +
            "    GROUP BY JobId " +
            "), " +
            "shortlist_count AS ( " +
            "    SELECT JobId, COUNT(*) AS shortlist_count " +
            "    FROM Shortlist " +
            "    GROUP BY JobId " +
            ") " +
            "SELECT j.*," +
            "       COALESCE(ac.apply_count, 0) AS apply_count, " +
            "       COALESCE(dc.dislike_count, 0) AS dislike_count, " +
            "       COALESCE(sc.shortlist_count, 0) AS shortlist_count " +
            "FROM JobDetailsView j " +
            "LEFT JOIN application_count ac ON j.JobId = ac.JobId " +
            "LEFT JOIN dislike_count dc ON j.JobId = dc.JobId " +
            "LEFT JOIN shortlist_count sc ON j.JobId = sc.JobId " +
            "WHERE j.IsActive = 1 " +
            "AND (?1 IS NULL OR j.CityId = ?1) " +
            "AND (?2 IS NULL OR j.CompanyId = ?2) " +
            "AND (?3 IS NULL OR j.MinSalary >= ?3) " +
            "AND (?4 IS NULL OR j.MaxSalary <= ?4) " +
            "AND (?5 IS NULL OR j.WorkType = ?5) "
        );

        // Conditionally add the NOT EXISTS clause if userId is provided
        if (userId != null) {
            sql.append("AND NOT EXISTS ( " +
                       "    SELECT 1 FROM Dislike d WHERE d.EmployeeId = ?8 AND d.JobId = j.JobId " +
                       ") ");
        }

        sql.append("ORDER BY j.PostDate DESC");

        if (limit != null) sql.append(" LIMIT ?6");
        if (offset != null) sql.append(" OFFSET ?7");

        // Create a list of parameters to pass to the query
        List<Object> params = new ArrayList<>();
        params.add(cityId);
        params.add(companyId);
        params.add(minSalary);
        params.add(maxSalary);
        params.add(workType);
        if (limit != null) params.add(limit);
        if (offset != null) params.add(offset);
        if (userId != null) params.add(userId);

        return jdbcTemplate.query(sql.toString(), jobRowMapper, params.toArray());
    }

    public List<JobPosting> getRecommendedJobs(Long jobId, Long userId) {
        StringBuilder sql = new StringBuilder(
            "WITH JobIndustry AS ( " +
            "    SELECT j.*, f.IndustryId, e.CompanyId" +
            "    FROM JobPostings j " +
            "    JOIN Employers e ON j.EmployerId = e.UserId " +
            "    JOIN FocusOn f ON e.CompanyId = f.CompanyId " +
            ") " +
            "SELECT T1.*, a.CompanyName, a.CityName, a.CountryName, COUNT(a.JobId) AS application_count " +
            "FROM JobIndustry T1 " +
            "JOIN JobDetailsView a ON T1.JobId = a.JobId " +
            "WHERE T1.IndustryId = ( " +
            "    SELECT f.IndustryId " +
            "    FROM JobPostings j " +
            "    JOIN Employers e ON j.EmployerId = e.UserId " +
            "    JOIN FocusOn f ON e.CompanyId = f.CompanyId " +
            "    WHERE j.JobId = ? " +
            ") " +
            "AND T1.JobId NOT IN ( " +
            "    SELECT a.JobId " +
            "    FROM Applications a " +
            "    WHERE a.EmployeeId = ? " +
            ") " +
            "GROUP BY T1.JobId " +
            "ORDER BY application_count DESC " +
            "LIMIT 3"
        );

        return jdbcTemplate.query(sql.toString(), jobRowMapper, jobId, userId);
    }

    public void applyToJob(Long employeeId, Long jobId) {
        String checkSql = "SELECT COUNT(*) FROM Applications WHERE EmployeeId = ? AND JobId = ?";
        int count = jdbcTemplate.queryForObject(checkSql, Integer.class, employeeId, jobId);

        if (count > 0) {
            throw new RuntimeException("You have already applied for this job");
        }

        String sql = "INSERT INTO Applications (EmployeeId, JobId) VALUES (?, ?)";
        jdbcTemplate.update(sql, employeeId, jobId);
    }

    public void postJob(JobPosting job) {
        String sql = "INSERT INTO JobPostings (EmployerId, Title, Description, MinSalary, " +
                    "MaxSalary, WorkType, CityId) VALUES (?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
            job.getEmployerId(), job.getTitle(), job.getDescription(),
            job.getMinSalary(), job.getMaxSalary(), job.getWorkType(), job.getCityId());
    }

    public List<Map<String, Object>> getApplications(Long employerId) {
        String sql = "SELECT j.JobId AS jobId, j.Title AS jobTitle, u.UserName AS userName, u.Email as email, e.ResumeUrl as resume, a.EmployeeId AS employeeId, a.Status AS status, a.ApplyDate AS applyDate " +
             "FROM Applications a " +
             "JOIN Users u ON a.EmployeeId = u.UserId " +
             "JOIN Employees e ON e.UserId = u.UserId " +
             "JOIN JobPostings j INDEXED BY idxOnEmployerJobs ON a.JobId = j.JobId " +
             "WHERE j.EmployerId = ? " +
             "ORDER BY j.JobId";

        return jdbcTemplate.queryForList(sql, employerId);
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

    // Get total count of jobs for pagination
    public int getTotalJobCount(Long cityId, Long companyId, Double minSalary, Double maxSalary, String workType) {
        StringBuilder sql = new StringBuilder(
            "SELECT COUNT(*) " +
            "FROM JobDetailsView j " +
            "WHERE j.IsActive = 1 " +
            "AND (?1 IS NULL OR j.CityId = ?1) " +
            "AND (?2 IS NULL OR j.CompanyId = ?2) " +
            "AND (?3 IS NULL OR j.MinSalary >= ?3) " +
            "AND (?4 IS NULL OR j.MaxSalary <= ?4) " +
            "AND (?5 IS NULL OR j.WorkType = ?5)"
        );

        List<Object> params = new ArrayList<>();
        params.add(cityId);
        params.add(companyId);
        params.add(minSalary);
        params.add(maxSalary);
        params.add(workType);

        return jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
    }
    // Shortlist a job
    public void shortlistJob(Long employeeId, Long jobId) {
        String sql = "INSERT INTO Shortlist (EmployeeId, JobId) VALUES (?, ?)";
        jdbcTemplate.update(sql, employeeId, jobId);
    }

    // Unshortlist a job
    public void unshortlistJob(Long employeeId, Long jobId) {
        String sql = "DELETE FROM Shortlist WHERE EmployeeId = ? AND JobId = ?";
        jdbcTemplate.update(sql, employeeId, jobId);
    }

    // Dislike a job
    public void dislikeJob(Long employeeId, Long jobId) {
        String sql = "INSERT INTO Dislike (EmployeeId, JobId) VALUES (?, ?)";
        jdbcTemplate.update(sql, employeeId, jobId);
    }

    // UnDislike a job
    public void undislikeJob(Long employeeId, Long jobId) {
        String sql = "DELETE FROM Dislike WHERE EmployeeId = ? AND JobId = ?";
        jdbcTemplate.update(sql, employeeId, jobId);
    }

    // Get shortlisted jobs
    public List<JobPosting> getShortlistedJobs(Long employeeId) {
        String sql = "SELECT j.* FROM JobDetailsView j " +
                    "JOIN Shortlist s ON j.JobId = s.JobId " +
                    "WHERE s.EmployeeId = ? " +
                    "ORDER BY j.PostDate DESC";
        return jdbcTemplate.query(sql, jobRowMapper, employeeId);
    }

    public void changeApplicationStatus(Long employeeId, Long jobId, String status) {
        String sql = "UPDATE Applications SET Status = ? WHERE EmployeeId = ? AND JobId = ?";
        jdbcTemplate.update(sql, status, employeeId, jobId);
    }
}
