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

        // Get independent top 10% averages for each metric
        String topSql =
            "SELECT " +
            "    (SELECT AVG(ApplyCount) FROM (" +
            "        SELECT ApplyCount, NTILE(10) OVER (ORDER BY ApplyCount DESC) as nt " +
            "        FROM JobAverageStats WHERE CityId = ?" +
            "    ) WHERE nt = 1) as top_apply, " +
            "    (SELECT AVG(DislikeCount) FROM (" +
            "        SELECT DislikeCount, NTILE(10) OVER (ORDER BY DislikeCount) as nt " +
            "        FROM JobAverageStats WHERE CityId = ?" +
            "    ) WHERE nt = 1) as top_dislike, " +
            "    (SELECT AVG(ShortlistCount) FROM (" +
            "        SELECT ShortlistCount, NTILE(10) OVER (ORDER BY ShortlistCount DESC) as nt " +
            "        FROM JobAverageStats WHERE CityId = ?" +
            "    ) WHERE nt = 1) as top_shortlist";

        Map<String, Object> result = new HashMap<>();
        result.put("averages", jdbcTemplate.queryForMap(avgSql, cityId));
        result.put("top_10_percent", jdbcTemplate.queryForMap(topSql, cityId));
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
            "    AND c2.CompanyId != c1.CompanyId " +
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
}