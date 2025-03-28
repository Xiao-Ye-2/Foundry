package components.views;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Component
public class JobDetailsViewManager {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void createView() {
        String sql =
            "CREATE VIEW IF NOT EXISTS JobDetailsView AS " +
            "SELECT j.*, c.CompanyName, ci.CityName, co.CountryName, c.CompanyId " +
            "FROM JobPostings j " +
            "JOIN Employers e ON j.EmployerId = e.UserId " +
            "JOIN Companies c ON e.CompanyId = c.CompanyId " +
            "JOIN Cities ci ON j.CityId = ci.CityId " +
            "JOIN Countries co ON ci.CountryId = co.CountryId";
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            System.err.println("Error creating JobDetailsView: " + e.getMessage());
        }
    }

    @PreDestroy
    public void dropView() {
        try {
            jdbcTemplate.execute("DROP VIEW IF EXISTS JobDetailsView");
        } catch (Exception e) {
            System.err.println("Error dropping JobDetailsView: " + e.getMessage());
        }
    }
}