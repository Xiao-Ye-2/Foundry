package data;

public class JobPosting {
    private String jobId;
    private String title;
    private String description;
    private String location;
    private Double minSalary;

    // Getters and Setters
    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getMinSalary() {
        return minSalary;
    }

    public void setMinSalary(Double minSalary) {
        this.minSalary = minSalary;
    }
}