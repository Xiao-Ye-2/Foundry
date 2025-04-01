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
    public void createDatabaseObjects() {
        createJobDetailsView();
        createAutoWithdrawTrigger();
    }

    private void createJobDetailsView() {
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

    private void createAutoWithdrawTrigger() {
        String sql =
            "CREATE TRIGGER IF NOT EXISTS auto_withdraw_applications " +
            "AFTER UPDATE ON Applications " +
            "WHEN NEW.Status = 'Accepted' AND OLD.Status != 'Accepted' " +
            "BEGIN " +
            "    UPDATE Applications " +
            "    SET Status = 'Withdrawn' " +
            "    WHERE JobId = NEW.JobId " +
            "    AND EmployeeId != NEW.EmployeeId " +
            "    AND Status != 'Withdrawn' " +
            "    AND Status != 'Accepted'; " +
            "END;";

        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            System.err.println("Error creating auto_withdraw_applications trigger: " + e.getMessage());
        }
    }

    @PreDestroy
    public void dropDatabaseObjects() {
        dropJobDetailsView();
        dropAutoWithdrawTrigger();
    }

    private void dropJobDetailsView() {
        try {
            jdbcTemplate.execute("DROP VIEW IF EXISTS JobDetailsView");
        } catch (Exception e) {
            System.err.println("Error dropping JobDetailsView: " + e.getMessage());
        }
    }

    private void dropAutoWithdrawTrigger() {
        try {
            jdbcTemplate.execute("DROP TRIGGER IF EXISTS auto_withdraw_applications");
        } catch (Exception e) {
            System.err.println("Error dropping auto_withdraw_applications trigger: " + e.getMessage());
        }
    }
}