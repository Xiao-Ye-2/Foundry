import pandas as pd
import json
import os
import kaggle
import tempfile

CSV_FILE = "job_descriptions.csv"

if os.path.exists(file_path):
    print("Dataset csv already existed, escape downloading")
else:
    print("Dataset csv does not exist, try downloading...")
    DATASET = "ravindrasinghrana/job-description-dataset"
    TEMP_DIR = tempfile.mkdtemp()
    try:
        kaggle_config_path = os.path.expanduser("~/.kaggle/kaggle.json")
        if not os.path.exists(kaggle_config_path):
            raise FileNotFoundError("Kaggle API credentials not found! Please place 'kaggle.json' in ~/.kaggle/")
        print("Downloading job dataset from Kaggle...")
        kaggle.api.dataset_download_files(DATASET, path=TEMP_DIR, unzip=True)
        csv_files = [f for f in os.listdir(TEMP_DIR) if f.endswith(".csv")]
        CSV_FILE = os.path.join(TEMP_DIR, csv_files[0]) if csv_files else None
        print("Download complete")
    except FileNotFoundError as e:
        print(f"ERROR: {e}")
        print("Solution: Please see README.md")
    except kaggle.rest.ApiException as e:
        print(f"Kaggle API error: {e}")
        print("Solution: Please see README.md")
    except Exception as e:
        print(f"Unexpected error: {e}")
        print("Solution: Please see README.md")

df = pd.read_csv(CSV_FILE)

print("Generating Industry.csv...")
def extract_industry(profile):
    if pd.isna(profile):  # Check if profile is NaN (missing)
        return None
    try:
        profile_str = str(profile).replace("'", "\"")  # Convert to string & replace single quotes with double quotes
        profile_dict = json.loads(profile_str)  # Convert JSON-like string to dictionary
        return profile_dict.get("Industry", None)  # Extract "Industry" if it exists
    except json.JSONDecodeError:
        return None  # Return None if JSON parsing fails
df["Industry"] = df["Company Profile"].apply(extract_industry)
unique_industries = df["Industry"].dropna().unique()
industry_map = {industry: idx + 1 for idx, industry in enumerate(unique_industries)}
industry_df = pd.DataFrame(list(industry_map.items()), columns=["IndustryName", "IndustryId"])
industry_df = industry_df[["IndustryId", "IndustryName"]]
industry_df.to_csv("Industry.csv", index=False)

print("Generating Countries.csv...")
countries = df[['Country']].drop_duplicates().reset_index(drop=True)
countries['CountryId'] = countries.index + 1
countries.rename(columns={'Country': 'CountryName'}, inplace=True)
countries = countries[["CountryId", "CountryName"]]
countries.to_csv("Countries.csv", index=False)

country_map = dict(zip(countries['CountryName'], countries['CountryId']))

print("Generating Cities.csv...")
cities = df[['location', 'Country']].drop_duplicates().reset_index(drop=True)
cities['CountryId'] = cities['Country'].map(country_map)
cities.drop(columns=['Country'], inplace=True)
cities['CityId'] = cities.index + 1
cities.rename(columns={'location': 'CityName'}, inplace=True)
cities = cities[["CityId", "CityName", "CountryId"]]
cities.to_csv("Cities.csv", index=False)

city_map = dict(zip(zip(cities['CityName'], cities['CountryId']), cities['CityId']))

print("Generating Companies.csv...")
companies = df[['Company', 'Company Size', 'location', 'Country']].drop_duplicates(subset=["Company"], keep="first").reset_index(drop=True)
companies['CityId'] = companies.apply(lambda row: city_map.get((row['location'], country_map[row['Country']])), axis=1)
companies.drop(columns=['location', 'Country'], inplace=True)
companies['CompanyId'] = companies.index + 1
companies.rename(columns={'Company Size': 'Size', 'Company': 'CompanyName'}, inplace=True)
companies = companies[["CompanyId", "CompanyName", "Size", "CityId"]]
companies.to_csv("Companies.csv", index=False)

company_map = dict(zip(companies['CompanyName'], companies['CompanyId']))

usersAll = df[['Contact Person', 'Contact', 'location', 'Country', 'Company']].drop_duplicates(subset=["Contact"], keep="first").reset_index(drop=True)
usersAll['CityId'] = usersAll.apply(lambda row: city_map.get((row['location'], country_map[row['Country']])), axis=1)
usersAll['CompanyId'] = usersAll["Company"].map(company_map)
usersAll['UserId'] = usersAll.index + 1

print("Generating Users.csv...")
users = usersAll[['Contact Person', 'Contact', 'CityId', 'UserId']].copy()
users.rename(columns={'Contact Person': 'UserName', 'Contact': 'Phone'}, inplace=True)
users['PasswordHash'] = '####'  # Placeholder for security
users['Role'] = 'employer'  # Assuming all contacts are employers
users = users[["UserId","Phone","PasswordHash","UserName","CityId","Role"]]
users.to_csv("Users.csv", index=False, na_rep="\\N")

user_map = dict(zip(usersAll['Contact'], usersAll['UserId']))

print("Generating Employers.csv...")
employers = usersAll[['UserId', "CompanyId"]].copy()
employers.dropna(inplace=True)
employers = employers[["UserId","CompanyId"]]
employers.to_csv("Employers.csv", index=False)

print("Generating JobPostings.csv...")
jobs = df[['Role', 'Job Description', 'Salary Range', 'Work Type', 'location', 'Country', 'Job Posting Date', 'Contact Person', 'Contact', 'Company']].drop_duplicates()
jobs[['MinSalary', 'MaxSalary']] = jobs['Salary Range'].str.extract(r'\$?(\d+)K?-?\$?(\d+)?K?')
jobs['WorkType'] = jobs['Work Type'].map(lambda x: x if x in ['Full-time', 'Part-time', 'Contract', 'Intern'] else 'Full-time')
jobs['CityId'] = jobs.apply(lambda row: city_map.get((row['location'], country_map[row['Country']])), axis=1)
jobs['EmployerId'] = jobs["Contact"].map(user_map)
jobs['IsActive'] = 1  # Assuming all job postings are active
jobs['JobId'] = jobs.index + 1
jobs.rename(columns={'Role': 'Title', 'Job Description': 'Description', 'Job Posting Date': 'PostDate'}, inplace=True)
jobs = jobs[['JobId', 'EmployerId', 'Title', 'Description', 'MinSalary', 'MaxSalary', 'WorkType', 'CityId', 'IsActive', 'PostDate']]
jobs.to_csv("JobPostings.csv", index=False)

print("CSV files generated successfully!")
