package data;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class JobRowMapper implements RowMapper<JobPosting> {
    @Override
    public JobPosting mapRow(ResultSet rs, int rowNum) throws SQLException {
        JobPosting jobPosting = new JobPosting();
        jobPosting.setJobId(rs.getLong("JobId"));
        jobPosting.setEmployerId(rs.getLong("EmployerId"));
        jobPosting.setTitle(rs.getString("Title"));
        jobPosting.setDescription(rs.getString("Description"));
        jobPosting.setMinSalary(rs.getDouble("MinSalary"));
        jobPosting.setMaxSalary(rs.getDouble("MaxSalary"));
        jobPosting.setWorkType(rs.getString("WorkType"));
        jobPosting.setCityId(rs.getLong("CityId"));
        jobPosting.setIsActive(rs.getBoolean("IsActive"));
        jobPosting.setPostDate(rs.getString("PostDate"));
        jobPosting.setCompanyName(rs.getString("CompanyName"));
        jobPosting.setCityName(rs.getString("CityName"));
        return jobPosting;
    }
}