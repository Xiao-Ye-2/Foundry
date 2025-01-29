package controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import service.DatabaseService;

@RestController
@RequestMapping("/api")
public class DatabaseController {
    @Autowired
    private DatabaseService databaseService;

    @GetMapping("/student/{snum}")
    public String getStudentClasses(@PathVariable String snum) {
        return databaseService.getStudentClasses(snum);
    }

    @GetMapping("/class/{name}")
    public String getClassStudents(@PathVariable String name) {
        return databaseService.getClassStudents(name);
    }

    @PostMapping("/class")
    public String addClass(@RequestBody String classInfo) {
        return databaseService.addClass(classInfo);
    }
}