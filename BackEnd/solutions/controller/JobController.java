package controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import data.ApplicationRequest;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

import data.JobPosting;
import service.JobService;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    @Autowired
    private JobService jobService;

    @GetMapping
    @CrossOrigin(origins = "http://localhost:5173")
    public List<JobPosting> getAllJobs(
        @RequestParam(required = false, defaultValue = "0") Integer page,
        @RequestParam(required = false, defaultValue = "75") Integer pageSize
    ) {
        // Calculate offset based on page number and page size
        Integer offset = page * pageSize;
        // Use searchJobs with no filters and with pagination params
        return jobService.searchJobs(null, null, null, null, null, pageSize, offset, null);
    }

    @GetMapping("/recommendations")
    @CrossOrigin(origins = "http://localhost:5173")
    public List<JobPosting> getRecommendedJobs(
        @RequestParam Long jobId,
        @RequestParam Long userId) {
        return jobService.getRecommendedJobs(jobId, userId);
    }


    // R6: Job search
    @GetMapping("/search")
    @CrossOrigin(origins = "http://localhost:5173")
    public List<JobPosting> searchJobs(
        @RequestParam(required = false) Long cityId,
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) Double minSalary,
        @RequestParam(required = false) Double maxSalary,
        @RequestParam(required = false) String workType,
        @RequestParam(required = false, defaultValue = "75") Integer pageSize,
        @RequestParam(required = false, defaultValue = "0") Integer page,
        @RequestParam(required = false) Long userId) {
        // Calculate offset based on page number and page size
        Integer offset = page * pageSize;
        return jobService.searchJobs(cityId, companyId, minSalary, maxSalary, workType, pageSize, offset, userId);
    }

    // R7: Apply to a job
    @PostMapping("/apply")
    @CrossOrigin(origins = "http://localhost:5173")
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
    @CrossOrigin(origins = "http://localhost:5173")
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
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getApplications(@RequestHeader("user-id") Long employerId) {
        try {
            return ResponseEntity.ok(jobService.getApplications(employerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get applications by employee ID
    @GetMapping("/applications/employee/{employeeId}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getApplicationsByEmployeeId(@PathVariable Long employeeId) {
        try {
            List<Map<String, Object>> applications = jobService.getApplicationsByEmployeeId(employeeId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get total count for pagination
    @GetMapping("/count")
    @CrossOrigin(origins = "http://localhost:5173")
    public int getJobsCount(
        @RequestParam(required = false) Long cityId,
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) Double minSalary,
        @RequestParam(required = false) Double maxSalary,
        @RequestParam(required = false) String workType) {
        return jobService.getTotalJobCount(cityId, companyId, minSalary, maxSalary, workType);
    }
}