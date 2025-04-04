# Foundry
Foundry - A job search app

### Clone the repository
git clone https://github.com/Xiao-Ye-2/Foundry.git
cd Foundry

### Create and activate a virtual environment
python3 -m venv venv
#### On macOS/Linux :
source venv/bin/activate
#### On Windows
venv\Scripts\activate

### Install dependencies
pip3 install -r requirements.txt

### Download the dataset of the project
#### Option1:
Go to [Kaggle Job Dataset](https://www.kaggle.com/datasets/ravindrasinghrana/job-Description-dataset/data) and click download
Move job_Descriptions.csv to Foundry/backend/Database/proddb
#### Option2:
Register or sign in to a [Kaggle account](https://www.kaggle.com/account/login)  
Click on your avatar and go to Settings  
Go to API section and Create New Token  
Move kaggle.json to ~/.kaggle/  
Run: chmod 600 ~/.kaggle/kaggle.json  

### Set up the database
Run setup.sh

### Featrues Supported
1. Apply to a Job  
User: Employee  
Description: Click "Apply" on a job listing, and an application is recorded with the status "Pending".
2. View Applications (Employer)  
User: Employer  
Description: View all applications for their posted jobs.
3. Location average salary analysis  
Users: Employee  
Description: The user goes to the analysis board, chooses Location and AvgMinSalary / AvgMaxSalary. Then a table shows which contains the average minimum / maximum salary of all jobs for each city. The data is sorted by salary in a non-increasing order. 
4. Shortlist / Dislike job postings  
User: Employee  
Description: Employees can shortlist jobs to revisit later. Shortlisted jobs are saved and displayed in a dedicated “Shortlist” tab. Users can remove a job from the shortlist, and re-shortlist it later. The dislike feature hides a job from the main job list and prevents it from reappearing.
5. Log in  
User: Employee/Employer  
Description: The user selects their role (employer/employee), and then input their identifier (email or phone number), and password. After input their credential, the user clicks on the 'Login' button, and a new page will display all jobs.
6. Register a new user using a transaction  
User: Employee/Employer  
Description: The user provides all necessary information for an account registration and clicks the register button.
7. Application status change trigger  
User: Employer  
Description: The employers can change the status of an application, which will trigger the changes.
8. Advanced job posting search using WITH/VIEWs  
User: Employee  
Description: The user provided a list of filters (options), and all job posting details are returned along with the corresponding apply, dislike, and shortlist counts appended.
9. Analysis dashboard on company/locations stats  
User: Employee/Employer  
Description: The query will return a list or map of values (numbers) reflecting the corresponding view information related to the analysis, such as the average apply, dislike, and shortlist counts per company for job postings.
10. Recommend 3 related job postings   
User: Employee  
Description: The employee can click on the recommendation button to receive three recommended job postings.




