package service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import data.Company;
import java.util.List;
import data.mapper.CompanyMapper;

@Service
public class CompanyService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final CompanyMapper companyMapper = new CompanyMapper();

    public List<Company> getAllCompanies() {
        String sql = "SELECT CompanyId, CompanyName " +
                    "FROM Companies " +
                    "ORDER BY CompanyName ASC";

        return jdbcTemplate.query(sql, companyMapper);
    }
}