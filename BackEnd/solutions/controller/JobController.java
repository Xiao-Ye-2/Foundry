package controller;

import org.springframework.web.bind.annotation.*;

import data.ApplicationRequest;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

import data.JobPosting;
import service.JobService;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    @Autowired
    private JobService jobService;

    // R6: Job search
    @GetMapping("/search")
    public List<JobPosting> searchJobs(
        @RequestParam(required = false) String location,
        @RequestParam(required = false) Double minSalary
    ) {
        return jobService.searchJobs(location, minSalary);
    }

    // R7: Apply to a job
    @PostMapping("/apply")
    public String applyToJob(@RequestBody ApplicationRequest request) {
        return jobService.applyToJob(request.getEmployeeId(), request.getJobId());
    }

    // R8: Post a job (Employer-only)
    @PostMapping("/post")
    public String postJob(@RequestBody JobPosting job, @RequestHeader("user-id") Long employerId) {
        return jobService.postJob(job, employerId);
    }
}