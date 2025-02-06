package data;

import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;

public class JobRowMapper implements RowMapper<JobPosting> {
    @Override
    public JobPosting mapRow(ResultSet rs, int rowNum) throws SQLException {
        JobPosting jobPosting = new JobPosting();
        jobPosting.setJobId(rs.getString("job_id"));
        jobPosting.setTitle(rs.getString("title"));
        jobPosting.setDescription(rs.getString("description"));
        jobPosting.setLocation(rs.getString("location"));
        jobPosting.setMinSalary(rs.getDouble("min_salary"));
        return jobPosting;
    }
}