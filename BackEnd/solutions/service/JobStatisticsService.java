package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.HashMap;
import java.util.List;


@Service
public class JobStatisticsService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Location-based statistics
    public Map<String, Object> getLocationStats(Long cityId) {
        // Get average counts for the location
        String avgSql =
            "SELECT " +
            "    AVG(ApplyCount) as avg_apply, " +
            "    AVG(DislikeCount) as avg_dislike, " +
            "    AVG(ShortlistCount) as avg_shortlist " +
            "FROM JobAverageStats " +
            "WHERE CityId = ?";

        // Separate queries for each top 10% metric
        String topApplySql =
            "SELECT AVG(ApplyCount) as top_apply FROM (" +
            "    SELECT ApplyCount, NTILE(10) OVER (ORDER BY ApplyCount DESC) as nt " +
            "    FROM JobAverageStats WHERE CityId = ?" +
            ") subquery WHERE nt = 1";

        String topDislikeSql =
            "SELECT AVG(DislikeCount) as top_dislike FROM (" +
            "    SELECT DislikeCount, NTILE(10) OVER (ORDER BY DislikeCount) as nt " +
            "    FROM JobAverageStats WHERE CityId = ?" +
            ") subquery WHERE nt = 1";

        String topShortlistSql =
            "SELECT AVG(ShortlistCount) as top_shortlist FROM (" +
            "    SELECT ShortlistCount, NTILE(10) OVER (ORDER BY ShortlistCount DESC) as nt " +
            "    FROM JobAverageStats WHERE CityId = ?" +
            ") subquery WHERE nt = 1";

        // Execute queries and store results
        Map<String, Object> result = new HashMap<>();
        result.put("averages", jdbcTemplate.queryForMap(avgSql, cityId));

        Map<String, Object> topApply = jdbcTemplate.queryForMap(topApplySql, cityId);
        Map<String, Object> topDislike = jdbcTemplate.queryForMap(topDislikeSql, cityId);
        Map<String, Object> topShortlist = jdbcTemplate.queryForMap(topShortlistSql, cityId);

        // Combine into a single map
        Map<String, Object> top10Percent = new HashMap<>();
        top10Percent.putAll(topApply);
        top10Percent.putAll(topDislike);
        top10Percent.putAll(topShortlist);

        result.put("top_10_percent", top10Percent);
        return result;
    }

    // Company-based statistics
    public Map<String, Object> getCompanyStats(Long companyId) {
        // Get company's stats
        String companySql =
            "SELECT " +
            "    AVG(ApplyCount) as avg_apply, " +
            "    AVG(DislikeCount) as avg_dislike, " +
            "    AVG(ShortlistCount) as avg_shortlist " +
            "FROM JobAverageStats " +
            "WHERE CompanyId = ?";

        // Get independent top 10% stats from companies with same focus using NTILE
        String topSql =
            "WITH SameFocusCompanies AS ( " +
            "    SELECT DISTINCT c2.CompanyId " +
            "    FROM Companies c1 " +
            "    JOIN FocusOn f1 ON c1.CompanyId = f1.CompanyId " +
            "    JOIN FocusOn f2 ON f1.IndustryId = f2.IndustryId " +
            "    JOIN Companies c2 ON f2.CompanyId = c2.CompanyId " +
            "    WHERE c1.CompanyId = ? " +
            // "    AND c2.CompanyId != c1.CompanyId " + // not exclude itself
            ") " +
            "SELECT " +
            "    (SELECT AVG(ApplyCount) FROM (" +
            "        SELECT ApplyCount, NTILE(10) OVER (ORDER BY ApplyCount DESC) as nt " +
            "        FROM JobAverageStats " +
            "        WHERE CompanyId IN (SELECT CompanyId FROM SameFocusCompanies)" +
            "    ) WHERE nt = 1) as top_apply, " +
            "    (SELECT AVG(DislikeCount) FROM (" +
            "        SELECT DislikeCount, NTILE(10) OVER (ORDER BY DislikeCount) as nt " +
            "        FROM JobAverageStats " +
            "        WHERE CompanyId IN (SELECT CompanyId FROM SameFocusCompanies)" +
            "    ) WHERE nt = 1) as top_dislike, " +
            "    (SELECT AVG(ShortlistCount) FROM (" +
            "        SELECT ShortlistCount, NTILE(10) OVER (ORDER BY ShortlistCount DESC) as nt " +
            "        FROM JobAverageStats " +
            "        WHERE CompanyId IN (SELECT CompanyId FROM SameFocusCompanies)" +
            "    ) WHERE nt = 1) as top_shortlist";

        Map<String, Object> result = new HashMap<>();
        result.put("company_averages", jdbcTemplate.queryForMap(companySql, companyId));
        result.put("industry_top_10_percent", jdbcTemplate.queryForMap(topSql, companyId));

        return result;
    }

    public List<Map<String, Object>> getShortlistRatioStats() {
        String sql = "SELECT * FROM ShortlistApplicationRatio ORDER BY ShortlistToApplicationRatio DESC LIMIT 10";
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            System.err.println("Error getting shortlist ratio stats: " + e.getMessage());
            throw e;
        }
    }

    public Map<String, Object> getShortlistRatioForJob(Long jobId) {
        String sql = "SELECT * FROM ShortlistApplicationRatio WHERE JobId = ?";
        try {
            return jdbcTemplate.queryForMap(sql, jobId);
        } catch (Exception e) {
            System.err.println("Error getting shortlist ratio for job " + jobId + ": " + e.getMessage());
            throw e;
        }
    }

    public List<Map<String, Object>> getShortlistRatioForEmployer(Long employerId) {
        String sql = "SELECT sar.* " +
                        "FROM ShortlistApplicationRatio sar " +
                        "JOIN JobPostings jp ON sar.JobId = jp.JobId " +
                        "WHERE jp.EmployerId = ?";
        try {
            return jdbcTemplate.queryForList(sql, employerId);
        } catch (Exception e) {
            System.err.println("Error getting shortlist ratio for employer " + employerId + ": " + e.getMessage());
            throw e;
        }
    }

    public List<Map<String, Object>> getLocationMinsalary() {
        String sql =
            "SELECT " +
            "    j.CityName, " +
            "    j.CountryName, " +
            "    AVG(j.MinSalary) AS AvgSalary " +
            "FROM JobDetailsView j " +
            "GROUP BY j.CityName, j.CountryName " +
            "ORDER BY AvgSalary DESC";
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            System.err.println("Error getting sorted locations by minsalary " + e.getMessage());
            throw e;
        }
    }

    public List<Map<String, Object>> getLocationMaxsalary() {
        String sql =
            "SELECT " +
            "    j.CityName, " +
            "    j.CountryName, " +
            "    AVG(j.MaxSalary) AS AvgSalary " +
            "FROM JobDetailsView j " +
            "GROUP BY j.CityName, j.CountryName " +
            "ORDER BY AvgSalary DESC";
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            System.err.println("Error getting sorted locations by maxsalary " + e.getMessage());
            throw e;
        }
    }
}