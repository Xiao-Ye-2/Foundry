package controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;

import data.JobPosting;
import data.ApplicationRequest;
import service.JobService;
import service.JobStatisticsService;


@RestController
@RequestMapping("/api/jobs")
public class JobController {
    @Autowired
    private JobService jobService;
    @Autowired
    private JobStatisticsService statisticsService;

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


    // Job search
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

    // Apply to a job
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

    // Post a job (Employer-only)
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

    // View applications (Employer-only)
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

    // Shortlist a job
    @PostMapping("/shortlist")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> shortlistJob(
        @RequestParam Long employeeId,
        @RequestParam Long jobId
    ) {
        try {
            jobService.shortlistJob(employeeId, jobId);
            return ResponseEntity.ok("Job shortlisted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Remove a job from shortlist
    @DeleteMapping("/shortlist")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> unshortlistJob(
        @RequestParam Long employeeId,
        @RequestParam Long jobId
    ) {
        try {
            jobService.unshortlistJob(employeeId, jobId);
            return ResponseEntity.ok("Job removed from shortlist successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Get shortlisted jobs for an employee
    @GetMapping("/shortlist/{employeeId}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getShortlistedJobs(@PathVariable Long employeeId) {
        try {
            List<JobPosting> shortlistedJobs = jobService.getShortlistedJobs(employeeId);
            return ResponseEntity.ok(shortlistedJobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Dislike a job
    @PostMapping("/dislike")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> dislikeJob(
        @RequestParam Long employeeId,
        @RequestParam Long jobId
    ) {
        try {
            jobService.dislikeJob(employeeId, jobId);
            return ResponseEntity.ok("Job disliked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Remove a job from dislike list
    @DeleteMapping("/dislike")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> undislikeJob(
        @RequestParam Long employeeId,
        @RequestParam Long jobId
    ) {
        try {
            jobService.undislikeJob(employeeId, jobId);
            return ResponseEntity.ok("Job removed from dislike list successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/location/{cityId}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getLocationStats(@PathVariable Long cityId) {
        try {
            Map<String, Object> stats = statisticsService.getLocationStats(cityId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/company/{companyId}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getCompanyStats(@PathVariable Long companyId) {
        try {
            Map<String, Object> stats = statisticsService.getCompanyStats(companyId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/shortlist-ratio")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getShortlistRatioStats() {
        try {
            List<Map<String, Object>> ratioStats = statisticsService.getShortlistRatioStats();
            return ResponseEntity.ok(ratioStats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/shortlist-ratio/{jobId}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getShortlistRatioForJob(@PathVariable Long jobId) {
        try {
            Map<String, Object> ratioStats = statisticsService.getShortlistRatioForJob(jobId);
            return ResponseEntity.ok(ratioStats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/shortlist-ratio/employer/{employerId}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getShortlistRatioForEmployer(@PathVariable Long employerId) {
        System.out.println("Employer ID: " + employerId);
        try {
            List<Map<String, Object>> ratioStats = statisticsService.getShortlistRatioForEmployer(employerId);
            return ResponseEntity.ok(ratioStats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/location/minsalary")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getLocationMinsalary() {
        try {
            List<Map<String, Object>> sortedStats = statisticsService.getLocationMinsalary();
            return ResponseEntity.ok(sortedStats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/location/maxsalary")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> getLocationMaxsalary() {
        try {
            List<Map<String, Object>> sortedStats = statisticsService.getLocationMaxsalary();
            return ResponseEntity.ok(sortedStats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/applications/employer/changestatus/")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> changeApplicationStatus(
        @RequestParam Long employeeId,
        @RequestParam Long jobId,
        @RequestParam String status
    ) {
        try {
            jobService.changeApplicationStatus(employeeId, jobId, status);
            return ResponseEntity.ok("Application status changed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}