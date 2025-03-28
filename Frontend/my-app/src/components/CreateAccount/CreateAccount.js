import React, { useState } from "react";
import axios from "axios";
import "./CreateAccount.css";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    enrollment: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Basic email validation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!validateEmail(formData.email)) {
      setMessage("Invalid email format!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters!");
      return;
    }

    setIsLoading(true); // Show loading
    setMessage(""); // Clear previous messages

    try {
      await axios.post("http://localhost:5000/api/users/create", {
        enrollment: formData.enrollment,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      alert("Account created successfully!");
      setFormData({
        enrollment: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || "Server error occurred.");
      } else {
        setMessage("Network error. Check if backend is running.");
      }
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  return (
    <div className="create-account-container">
      <h1>👤 Create Account Page</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="enrollment">Enrollment</label>
          <input
            type="text"
            id="enrollment"
            name="enrollment"
            value={formData.enrollment}
            onChange={handleChange}
            required
            disabled={isLoading} // Disable during loading
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={isLoading}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default CreateAccount;