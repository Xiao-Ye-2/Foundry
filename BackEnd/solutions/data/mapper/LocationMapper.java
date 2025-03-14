package data.mapper;

import org.springframework.jdbc.core.RowMapper;
import data.Location;
import java.sql.ResultSet;
import java.sql.SQLException;

public class LocationMapper implements RowMapper<Location> {
    @Override
    public Location mapRow(ResultSet rs, int rowNum) throws SQLException {
        Location location = new Location();
        location.setCityId(rs.getLong("CityId"));
        location.setCityName(rs.getString("CityName"));
        location.setCountryName(rs.getString("CountryName"));
        return location;
    }
}