# Authentication API
A robust and secure authentication API built with Node.js, designed to provide modern authentication features and strong protection against common security threats.

## Features
 * **No SQL Injection**: All database queries are sanitized and parameterized to prevent SQL injection attacks.
* **Email Verification by Link**: Users must verify their email address via a secure link sent to their inbox before accessing protected resources.
* **2FA Authentication (OTP Based)**: Optional two-factor authentication using one-time passwords (OTP) for enhanced account security.
* **Rate Limiting (IP + Email)**: Protects against brute-force attacks by limiting the number of requests per IP and email address.
* **CSRF Protection**: Implements CSRF tokens to defend against cross-site request forgery attacks.
* **Role-Based Authentication**: Supports multiple user roles (e.g., admin, user) with access control for protected routes.
**Session-Based Authentication**: Maintains user sessions securely for persistent authentication.

## Getting Started
Prerequisites
* Node.js v16+
* MongoDB (NoSQL database)

Installation
```bash
git clone https://github.com/yourusername/authentication-api.git
cd authentication-api
npm install
```

Environment Variables
Create a **.env** file in the root directory and configure the following: