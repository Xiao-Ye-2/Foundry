package service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import data.UserProfile;
import data.LoginRequest;

@Service
public class UserService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void signUp(UserProfile userProfile) throws Exception {
        if (isDuplicateUser(userProfile.getPhone(), userProfile.getEmail())) {
            throw new Exception("A user with the same phone number or email already exists");
        }
    
        Long cityId = getCityId(userProfile.getCityName(), userProfile.getCountryName());
    
        String insertUserSql = "INSERT INTO Users (Phone, PasswordHash, UserName, CityId, Role, Email) VALUES (?, ?, ?, ?, ?, ?)";
        String hashedPassword = passwordEncoder.encode(userProfile.getPasswordHash());
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(insertUserSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, userProfile.getPhone());
            ps.setString(2, hashedPassword);
            ps.setString(3, userProfile.getUserName());
            ps.setLong(4, cityId);
            ps.setString(5, userProfile.getRole());
            ps.setString(6, userProfile.getEmail().length() > 0 ? userProfile.getEmail() : null);
            return ps;
        }, keyHolder);

        Long userId = Optional.ofNullable(keyHolder.getKey())
                     .map(Number::longValue)
                     .orElseThrow(() -> new Exception("Failed to retrieve generated user ID"));

    
        if ("employee".equalsIgnoreCase(userProfile.getRole())) {
            String insertEmployeeSql = "INSERT INTO Employees (UserId) VALUES (?)";
            jdbcTemplate.update(insertEmployeeSql, userId);
        } else if ("employer".equalsIgnoreCase(userProfile.getRole())) {
            String insertEmployerSql = "INSERT INTO Employers (UserId, CompanyId) VALUES (?, ?)";
            jdbcTemplate.update(insertEmployerSql, userId, userProfile.getCompanyId());
        } else {
            throw new Exception("Invalid role");
        }
    }

    public UserProfile login(LoginRequest loginRequest) throws Exception {
        String sql = "SELECT UserId, Phone, PasswordHash, UserName, Role, Email, CityId FROM Users WHERE Phone = ? OR Email = ?";
        
        List<Object> params = new ArrayList<>();
        params.add(loginRequest.getIdentifier());
        params.add(loginRequest.getIdentifier());

        UserProfile userProfile = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            UserProfile profile = new UserProfile();
            profile.setUserId(rs.getLong("UserId"));
            profile.setPhone(rs.getString("Phone"));
            profile.setPasswordHash(rs.getString("PasswordHash"));
            profile.setUserName(rs.getString("UserName"));
            profile.setRole(rs.getString("Role"));
            profile.setEmail(rs.getString("Email"));
            profile.setCityId(rs.getLong("CityId"));
            return profile;
        }, params.toArray());

        if (userProfile == null) {
            throw new Exception("Invalid Username or Password");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), userProfile.getPasswordHash())) {
            throw new Exception("Invalid Username or Password");
        }

        String citySql = "SELECT c.CityName, co.CountryName FROM Cities c JOIN Countries co ON c.CountryId = co.CountryId WHERE c.CityId = ?";
        List<String> cityDetails = jdbcTemplate.query(citySql, (rs, rowNum) -> rs.getString("CityName") + "," + rs.getString("CountryName"), new Object[]{userProfile.getCityId()});
        String[] cityDetailsArray = cityDetails.get(0).split(",");
        String cityName = cityDetailsArray[0];
        String countryName = cityDetailsArray[1];

        userProfile.setCityName(cityName);
        userProfile.setCountryName(countryName);

        // Remove the password hash before returning the profile
        userProfile.setPasswordHash(null);
        return userProfile;
    }

    private Long getCityId(String cityName, String countryName) throws Exception {
        String sql = "SELECT c.CityId FROM Cities c JOIN Countries co ON c.CountryId = co.CountryId WHERE c.CityName = ? AND co.CountryName = ?";
        List<Long> cityIds = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("CityId"), new Object[]{cityName, countryName});
    
        if (cityIds.isEmpty()) {
            throw new Exception("City not found");
        }
    
        return cityIds.get(0);
    }

    private boolean isDuplicateUser(String phone, String email) {
        System.out.println("Phone: " + phone + ", Email: " + email);
        String sql = "SELECT COUNT(*) FROM Users WHERE Phone = ? OR Email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, new Object[]{phone, email});
        return count != null && count > 0;
    }
}