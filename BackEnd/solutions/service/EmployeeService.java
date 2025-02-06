package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import data.EmployeeProfile;

@Service
public class EmployeeService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void updateProfile(Long employeeId, EmployeeProfile profile) {
        String sql = "UPDATE Employees SET ResumeUrl = ? WHERE UserId = ?";
        jdbcTemplate.update(sql, profile.getResumeUrl(), employeeId);
    }
}