package components.views;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import org.springframework.context.annotation.DependsOn;

@Component
@DependsOn("jobDetailsViewManager")
public class StatisticsViewManager {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void createAverageCountsView() {
        String sql =
            "CREATE VIEW IF NOT EXISTS JobAverageStats AS " +
            "SELECT " +
            "    j.*, " +
            "    j.CompanyName, " +
            "    e.CompanyId, " +
            "    COUNT(DISTINCT a.EmployeeId) AS ApplyCount, " +
            "    COUNT(DISTINCT d.EmployeeId) AS DislikeCount, " +
            "    COUNT(DISTINCT s.EmployeeId) AS ShortlistCount " +
            "FROM JobDetailsView j " +
            "JOIN Employers e ON j.EmployerId = e.UserId " +
            "LEFT JOIN Applications a ON j.JobId = a.JobId " +
            "LEFT JOIN Dislike d ON j.JobId = d.JobId " +
            "LEFT JOIN Shortlist s ON j.JobId = s.JobId " +
            "GROUP BY j.JobId, j.Title, j.CompanyName, e.CompanyId";
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            System.err.println("Error creating JobAverageStats view: " + e.getMessage());
        }
    }

    @PostConstruct
    public void createShortlistRatioView() {
        String sql =
            "CREATE VIEW IF NOT EXISTS ShortlistApplicationRatio AS " +
            "SELECT " +
            "    jp.JobId, " +
            "    jp.Title AS JobTitle, " +
            "    COUNT(DISTINCT SL.EmployeeId) AS TotalSL, " +
            "    COUNT(DISTINCT app.EmployeeId) AS TotalApp, " +
            "    CASE " +
            "        WHEN COUNT(DISTINCT app.EmployeeId) = 0 THEN NULL " +
            "        ELSE CAST(COUNT(DISTINCT sl.EmployeeId) AS REAL) / COUNT(DISTINCT app.EmployeeId) " +
            "    END AS ShortlistToApplicationRatio " +
            "FROM JobPostings jp " +
            "LEFT JOIN Shortlist SL ON jp.JobId = SL.JobId " +
            "LEFT JOIN Applications app ON jp.JobId = app.JobId " +
            "GROUP BY jp.JobId, jp.Title";
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            System.err.println("Error creating ShortlistApplicationRatio view: " + e.getMessage());
        }
    }

    @PreDestroy
    public void dropAverageCountsView() {
        try {
            jdbcTemplate.execute("DROP VIEW IF EXISTS JobAverageStats");
        } catch (Exception e) {
            System.err.println("Error dropping JobAverageStats view: " + e.getMessage());
        }
    }

    @PreDestroy
    public void dropShortlistRatioView() {
        try {
            jdbcTemplate.execute("DROP VIEW IF EXISTS ShortlistApplicationRatio");
        } catch (Exception e) {
            System.err.println("Error dropping ShortlistApplicationRatio view: " + e.getMessage());
        }
    }
}