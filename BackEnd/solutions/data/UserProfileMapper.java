package data;

import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;

public class UserProfileMapper implements RowMapper<UserProfile> {
    @Override
    public UserProfile mapRow(ResultSet rs, int rowNum) throws SQLException {
        UserProfile profile = new UserProfile();
        profile.setUserId(rs.getLong("UserId"));
        profile.setPhone(rs.getString("Phone"));
        profile.setPasswordHash(rs.getString("PasswordHash"));
        profile.setUserName(rs.getString("UserName"));
        profile.setRole(rs.getString("Role"));
        profile.setEmail(rs.getString("Email"));
        profile.setCityId(rs.getLong("CityId"));
        return profile;
    }
}