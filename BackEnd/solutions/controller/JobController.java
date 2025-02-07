package controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import data.ApplicationRequest;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

import data.JobPosting;
import service.JobService;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    @Autowired
    private JobService jobService;

    // R6: Job search
    @GetMapping("/search")
    public List<JobPosting> searchJobs(
        @RequestParam(required = false) String location,
        @RequestParam(required = false) Double minSalary,
        @RequestParam(required = false) String workType
    ) {
        return jobService.searchJobs(location, minSalary, workType);
    }

    // R7: Apply to a job
    @PostMapping("/apply")
    public ResponseEntity<?> applyToJob(@RequestBody ApplicationRequest request) {
        try {
            jobService.applyToJob(request.getEmployeeId(), Long.parseLong(request.getJobId()));
            return ResponseEntity.ok("Application submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // R8: Post a job (Employer-only)
    @PostMapping("/post")
    public ResponseEntity<?> postJob(
        @RequestBody JobPosting job,
        @RequestHeader("user-id") Long employerId
    ) {
        try {
            job.setEmployerId(employerId);
            jobService.postJob(job);
            return ResponseEntity.ok("Job posted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // R9: View applications (Employer-only)
    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(@RequestHeader("user-id") Long employerId) {
        try {
            return ResponseEntity.ok(jobService.getApplications(employerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get all jobs
    @GetMapping
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getAllJobs() {
        try {
            List<JobPosting> jobs = jobService.getAllJobs();
            if (jobs.isEmpty()) {
                return ResponseEntity.ok().body(new ArrayList<>());
            }
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body("Error fetching jobs: " + e.getMessage());
        }
    }
}