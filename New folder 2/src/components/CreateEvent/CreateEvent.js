import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import axios from "axios";
import "./CreateEvent.css"; // Import CSS for styling

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    eventPic: null,
    eventName: "",
    eventDescription: "",
    department: "",
    eventDate: "",
    eventTime: "",
    location: "",
    prize: "",
    isPaid: "",
  });

  const [message, setMessage] = useState(""); // To display success or error messages
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "eventPic") {
      setFormData({ ...formData, eventPic: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage
    if (!token) {
      setMessage("You must be logged in to create an event.");
      return;
    }
  
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]); // Append all formData fields
      });
  
      const response = await axios.post("http://localhost:5000/api/events/create", formDataToSend, {
        headers: {
          Authorization: token, // Pass the token in the Authorization header
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert(response.data.message); // Show success alert
      navigate("/dashboard"); // Redirect to the events page
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message); // Display error message from the backend
      } else {
        setMessage("An error occurred while creating the event.");
      }
    }
  };

  return (
    <div className="create-event-container">
      <h1>📅 Create Event Page</h1>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="eventPic">Event Picture</label>
          <input
            type="file"
            id="eventPic"
            name="eventPic"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventName">Event Name</label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventDescription">Event Description</label>
          <textarea
            id="eventDescription"
            name="eventDescription"
            value={formData.eventDescription}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="department">Department</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventDate">Event Date</label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="eventTime">Event Time</label>
          <input
            type="time"
            id="eventTime"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="prize">Prize</label>
          <input
            type="text"
            id="prize"
            name="prize"
            value={formData.prize}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="isPaid">Is the Event Paid or Unpaid?</label>
          <select
            id="isPaid"
            name="isPaid"
            value={formData.isPaid}
            onChange={handleChange}
            required
          >
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEvent;