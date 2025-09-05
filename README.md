
# QzPlatform

QzPlatform is an Enhanced Assessment Platform designed to revolutionize the assessment process with comprehensive solutions for computerized tests, examination management, quick grading systems, and result collation. Inspired by the functionality of Classmarker.com, QzPlatform is tailored for three major user roles: Admin, Test Creator, and Test Taker. This platform ensures seamless and efficient management of assessments, providing an intuitive and powerful tool for educators and institutions.

## Table of Contents

- [QzPlatform](#qzplatform)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [User Management](#user-management)
    - [Assessment Creation](#assessment-creation)
    - [Assessment Administration](#assessment-administration)
    - [Grading System](#grading-system)
    - [Result Collation](#result-collation)
    - [Reporting and Analytics](#reporting-and-analytics)
    - [Feedback Collection](#feedback-collection)
  - [Tech Stack](#tech-stack)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Documentation](#api-documentation)
  - [Contributing](#contributing)
  - [License](#license)

## Features

### User Management
- **Admin**: Manage users, roles, and permissions.
- **Test Creator**: Create and configure tests, manage question banks.
- **Test Taker**: Participate in assessments, view results and feedback.

### Assessment Creation
- Support for multiple question types: multiple choice, true/false, short answer, essay, and fill-in-the-gap.
- Configurable test parameters: time limits, question shuffling, randomizing answer choices, and custom instructions.

### Assessment Administration
- Test scheduling with notifications.
- User authentication with Single Sign-On (SSO) and Multi-Factor Authentication (MFA).
- Proctoring (remote or in-person) and session monitoring.

### Grading System
- Automatic grading for objective questions.
- Manual grading for subjective answers.

### Result Collation
- Automated collation of test results into comprehensive reports.

### Reporting and Analytics
- Analysis of test performance, question difficulty, and overall examination management.
- Custom report generation with export options to PDF and Excel.

### Feedback Collection
- Collection and presentation of feedback from test takers and examiners.

## Tech Stack

- **Backend**: 
  - Node.js
  - Express.js
  - MongoDB
- **Frontend**:
  - React

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/ATBTECHhub/QZ_PLATFORM-BACKEND.git
   ```
2. Navigate to the project directory:
   ```bash 
   cd QzPlatform
   ```
3. Install backend dependencies:
   ```bash
    cd backend
    npm install
   ```
4. Set up environment variables:
   *  Create a .env file in the backend directory and add the following variables:
    ```
        MONGO_URI=your_mongo_db_connection_string
        JWT_SECRET=your_jwt_secret
    ```
5.  Run the development servers:
   ```bash
    cd backend
    npm start
   ```

## Usage
After installation, you can access the platform at (https://qz-platform-backend-1.onrender.com) and start using the features as an Admin, Test Creator, or Test Taker.

## API Documentation
Comprehensive API documentation is available to guide you through the available endpoints and their usage. You can access the API documentation by navigating to http://localhost:3000/api-docs once the backend server is running.

## Contributing
We welcome contributions to enhance the QzPlatform. To contribute, please follow these steps:
1. Fork the Repository

2. Create a new branch for your feature or bugfix:
    ```bash
    git checkout -b feature-name
    ```

3. Commit your changes:
    ```bash
    git commit -m "Description of the feature"
    ```

4. Push the branch:
    ```bash
    git push origin feature-name
    ```

5. Create a pull request and describe the changes you made.

## License
This project is licensed under the MIT License. See the LICENSE file for more information.

***

QzPlatform is developed and maintained by Abdulhakeem Abdullahi, a Backend Developer with expertise in Node.js, Express.js, MongoDB, and React. If you have any questions or feedback, feel free to reach out.  

***
Thank you for using QzPlatform!
