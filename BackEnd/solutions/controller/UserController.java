package controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import data.UserProfile;
import data.LoginRequest;
import service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> signUp(@RequestBody UserProfile userProfile) {
        try {
            userService.signUp(userProfile);
            return ResponseEntity.ok("User signed up successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            UserProfile userProfile = userService.login(loginRequest);
            return ResponseEntity.ok().body(userProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}