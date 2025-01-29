package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DatabaseService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String getStudentClasses(String snum) {
        try {
            String query = "SELECT c.name FROM student s " +
                            "JOIN enrolled e ON s.snum = e.snum " +
                            "JOIN class c ON e.cname = c.name " +
                            "WHERE s.snum = ?";
            List<String> classes = jdbcTemplate.queryForList(query, String.class, snum);
            return String.join("\n", classes);
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public String getClassStudents(String className) {
        try {
            String query = "SELECT s.snum, s.sname FROM student s " +
                            "JOIN enrolled e ON s.snum = e.snum " +
                            "JOIN class c ON e.cname = c.name " +
                            "WHERE c.name = ?";
            List<Map<String, Object>> students = jdbcTemplate.queryForList(query, className);

            StringBuilder result = new StringBuilder();
            for (Map<String, Object> row : students) {
                result.append(row.get("snum"))
                      .append(", ")
                      .append(row.get("sname"))
                      .append("\n");
            }
            return result.toString();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    public String addClass(String classInfo) {
        try {
            String[] parts = classInfo.split(",");
            String query = "INSERT INTO class (name, meets_at, room, fid) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(query,
                parts[0].trim(),
                parts[1].trim(),
                parts[2].trim(),
                parts[3].trim()
            );
            return "Class added successfully";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}