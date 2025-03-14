package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import data.Location;
import java.util.List;
import data.mapper.LocationMapper;

@Service
public class LocationService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final LocationMapper locationMapper = new LocationMapper();

    public List<Location> getAllLocations() {
        String sql = "SELECT c.CityId, c.CityName, co.CountryName " +
                    "FROM Cities c " +
                    "JOIN Countries co ON c.CountryId = co.CountryId " +
                    "ORDER BY co.CountryName ASC, c.CityName ASC";

        return jdbcTemplate.query(sql, locationMapper);
    }
}