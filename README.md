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
Go to [Kaggle Job Dataset](https://www.kaggle.com/datasets/ravindrasinghrana/job-description-dataset/data) and click download  
Move job_descriptions.csv to Foundry/backend/Database/proddb
#### Option2:
Register or sign in to a [Kaggle account](https://www.kaggle.com/account/login)  
Click on your avatar and go to Settings  
Go to API section and Create New Token  
Move kaggle.json to ~/.kaggle/  
Run: chmod 600 ~/.kaggle/kaggle.json

### Set up the database
Run setup.sh

