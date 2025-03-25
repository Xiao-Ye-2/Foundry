package data.mapper;

import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.stereotype.Component;

import data.JobPosting;

@Component
public class JobRowMapper implements RowMapper<JobPosting> {
    @Override
    public JobPosting mapRow(ResultSet rs, int rowNum) throws SQLException {
        try {
            JobPosting jobPosting = new JobPosting();
            jobPosting.setJobId(rs.getLong("JobId"));
            jobPosting.setEmployerId(rs.getLong("EmployerId"));
            jobPosting.setTitle(rs.getString("Title"));
            jobPosting.setDescription(rs.getString("Description"));
            jobPosting.setMinSalary(rs.getDouble("MinSalary"));
            jobPosting.setMaxSalary(rs.getDouble("MaxSalary"));
            jobPosting.setWorkType(rs.getString("WorkType"));
            jobPosting.setIsActive(rs.getBoolean("IsActive"));
            jobPosting.setPostDate(rs.getString("PostDate"));

            // Handle potentially null values from LEFT JOINs
            String companyName = rs.getString("CompanyName");
            jobPosting.setCompanyName(companyName != null ? companyName : "Unknown Company");

            String cityName = rs.getString("CityName");
            jobPosting.setCityName(cityName != null ? cityName : "Remote");

            try {
                String countryName = rs.getString("CountryName");
                jobPosting.setCountryName(countryName != null ? countryName : "Unknown Country");
            } catch (SQLException e) {
                jobPosting.setCountryName("Unknown Country");
            }

            // Check for optional columns
            try {
                jobPosting.setApplyCount(rs.getInt("apply_count"));
            } catch (SQLException e) {
                jobPosting.setApplyCount(0); // Default value if column is missing
            }

            try {
                jobPosting.setDislikeCount(rs.getInt("dislike_count"));
            } catch (SQLException e) {
                jobPosting.setDislikeCount(0); // Default value if column is missing
            }

            try {
                jobPosting.setShortlistCount(rs.getInt("shortlist_count"));
            } catch (SQLException e) {
                jobPosting.setShortlistCount(0); // Default value if column is missing
            }

            return jobPosting;
        } catch (SQLException e) {
            System.err.println("Error mapping row to JobPosting:");
            e.printStackTrace();
            throw e;
        }
    }
}