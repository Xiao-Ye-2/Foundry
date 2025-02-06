package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import data.EmployeeProfile;
import service.EmployeeService;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    @Autowired
    private EmployeeService employeeService;

    // R10: Update employee profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
        @RequestHeader("user-id") Long employeeId,
        @RequestBody EmployeeProfile profile
    ) {
        try {
            employeeService.updateProfile(employeeId, profile);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}