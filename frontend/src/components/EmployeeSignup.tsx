import React, { useState } from 'react';
import '../styles/EmployeeSignup.css';


interface EmployeeSignupProps {
  onSignup: () => void;
  onBack: () => void;
}

const EmployeeSignup: React.FC<EmployeeSignupProps> = ({ onSignup, onBack }) => {
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [cityName, setcityName] = useState<string>('');
  const [countryName, setCountryName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');

  const countries = [
    "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba",
    "Australia", "Austria", "Azerbaijan", "Bahamas, The", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Cayman Islands", "Central African Republic", "Chad", "Chile",
    "China", "Colombia", "Comoros", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Curacao", "Cyprus", "Czech Republic",
    "Democratic Republic Of Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
    "Estonia", "Eswatini", "Ethiopia", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "Gabon", "Gambia",
    "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong SAR, China", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Rep.",
    "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
    "Kiribati", "Korea, Rep.", "Kosovo", "Kuwait", "Kyrgyz Republic", "Lao PDR", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao SAR, China", "Macedonia, FYR", "Madagascar", "Malawi", "Malaysia", "Maldives",
    "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia, Fed. Sts.", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand",
    "Nicaragua", "Niger", "Nigeria", "North Korea", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama",
    "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Republic Of Congo", "Romania",
    "Russia", "Rwanda", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
    "Singapore", "Sint Maarten (Dutch part)", "Slovak Republic", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka",
    "St. Kitts and Nevis", "St. Lucia", "St. Martin (French part)", "St. Vincent and the Grenadines", "Sudan", "Suriname", "Sweden", "Switzerland", "Syrian Arab Republic", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands",
    "Tuvalu", "UAE", "UK", "USA", "Uganda", "Ukraine", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela, RB",
    "Vietnam", "Virgin Islands (U.S.)", "West Bank and Gaza", "Yemen", "Zambia", "Zimbabwe"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || !password.trim() || !userName.trim() || !cityName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const userProfile = {
      phone,
      passwordHash: password, // In a real app, hash the password before sending
      userName,
      cityName: cityName,
      countryName: countryName,
      role: 'employee',
      email,
    };

    try {
        console.log(userProfile);
        const response = await fetch('http://localhost:8080/api/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage);
        }

        onSignup();
    } catch (error : any) {
      console.error('Error signing up:', error);
      setError(error.message);
    }
  };

  return (
    <div className="employee-signup-container">
      <h1 className="signup-title">Employee Sign Up</h1>
      <p className="signup-subtitle">Please fill in the details to create an account</p>

      <form className="signup-form" onSubmit={handleSubmit}>
        {error && <div className="signup-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="phone">Phone <span className="required">*</span></label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password <span className="required">*</span></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="userName">Full Name <span className="required">*</span></label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cityName">City <span className="required">*</span></label>
          <input
            type="text"
            id="cityName"
            value={cityName}
            onChange={(e) => setcityName(e.target.value)}
            placeholder="Enter your city ID"
            min="1"
          />
        </div>

        <div className="form-group">
            <label htmlFor="countryName">Country <span className="required">*</span></label>
            <select
                id="countryName"
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
            >
                <option value="">Select your country</option>
                {countries.map((country) => (
                <option key={country} value={country}>
                    {country}
                </option>
                ))}
            </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="signup-actions">
          <button type="button" className="back-button" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeSignup;