package service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;

import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import data.UserProfile;
import data.LoginRequest;
import data.mapper.UserProfileMapper;

@Service
public class UserService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserProfileMapper userProfileMapper;

    @Autowired
    public UserService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.userProfileMapper = new UserProfileMapper();
    }

    public void signUp(UserProfile userProfile) throws Exception {
        if (isDuplicateUser(userProfile.getPhone(), userProfile.getEmail())) {
            throw new Exception("A user with the same phone number or email already exists");
        }

        String insertUserSql = "INSERT INTO Users (Phone, PasswordHash, UserName, CityId, Role, Email) VALUES (?, ?, ?, ?, ?, ?)";
        String hashedPassword = passwordEncoder.encode(userProfile.getPasswordHash());

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(insertUserSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, userProfile.getPhone());
            ps.setString(2, hashedPassword);
            ps.setString(3, userProfile.getUserName());
            ps.setLong(4, userProfile.getCityId());
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
        UserProfile userProfile = findUserByIdentifier(loginRequest);
        validatePassword(loginRequest, userProfile);

        enrichUserProfile(userProfile);
        userProfile.setPasswordHash(null); // Remove password hash before returning

        return userProfile;
    }

    private UserProfile findUserByIdentifier(LoginRequest loginRequest) throws Exception {
        String sql = "SELECT UserId, Phone, PasswordHash, UserName, Role, Email, CityId " +
                    "FROM Users WHERE Phone = ? OR Email = ?";

        List<Object> params = new ArrayList<>();
        params.add(loginRequest.getIdentifier());
        params.add(loginRequest.getIdentifier());

        try {
            return jdbcTemplate.queryForObject(sql, userProfileMapper, params.toArray());
        } catch (EmptyResultDataAccessException e) {
            throw new Exception("User not found with provided email/phone");
        }
    }

    private void validatePassword(LoginRequest loginRequest, UserProfile userProfile) throws Exception {
        if (!passwordEncoder.matches(loginRequest.getPassword(), userProfile.getPasswordHash())) {
            throw new Exception("Invalid Username or Password");
        }
    }

    private void enrichUserProfile(UserProfile userProfile) {
        enrichWithCityDetails(userProfile);

        if ("employee".equalsIgnoreCase(userProfile.getRole())) {
            enrichWithResumeUrl(userProfile);
        } else if ("employer".equalsIgnoreCase(userProfile.getRole())) {
            enrichWithCompanyName(userProfile);
        }
    }

    private void enrichWithCityDetails(UserProfile userProfile) {
        String sql = "SELECT c.CityName, co.CountryName " +
                    "FROM Cities c " +
                    "JOIN Countries co ON c.CountryId = co.CountryId " +
                    "WHERE c.CityId = ?";

        List<String> cityDetails = jdbcTemplate.query(
            sql,
            (rs, rowNum) -> rs.getString("CityName") + "," + rs.getString("CountryName"),
            userProfile.getCityId()
        );

        String[] cityDetailsArray = cityDetails.get(0).split(",");
        userProfile.setCityName(cityDetailsArray[0]);
        userProfile.setCountryName(cityDetailsArray[1]);
    }

    private void enrichWithResumeUrl(UserProfile userProfile) {
        String sql = "SELECT ResumeUrl FROM Employees WHERE UserId = ?";
        String resumeUrl = jdbcTemplate.queryForObject(sql, String.class, userProfile.getUserId());
        userProfile.setResumeUrl(resumeUrl);
    }

    private void enrichWithCompanyName(UserProfile userProfile) {
        String sql = "SELECT c.CompanyName " +
                    "FROM Employers e " +
                    "JOIN Companies c ON e.CompanyId = c.CompanyId " +
                    "WHERE e.UserId = ?";

        String companyName = jdbcTemplate.queryForObject(sql, String.class, userProfile.getUserId());
        userProfile.setCompanyName(companyName);
    }

    private boolean isDuplicateUser(String phone, String email) {
        String sql = "SELECT COUNT(*) FROM Users WHERE Phone = ? OR Email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, phone, email);
        return count != null && count > 0;
    }
}