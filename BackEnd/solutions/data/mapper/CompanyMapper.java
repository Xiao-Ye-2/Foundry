package data.mapper;

import org.springframework.jdbc.core.RowMapper;
import data.Company;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CompanyMapper implements RowMapper<Company> {
    @Override
    public Company mapRow(ResultSet rs, int rowNum) throws SQLException {
        Company company = new Company();
        company.setCompanyId(rs.getLong("CompanyId"));
        company.setCompanyName(rs.getString("CompanyName"));
        return company;
    }
}