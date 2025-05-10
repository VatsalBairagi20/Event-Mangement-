import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Events.css";

const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState({ upcoming: [], current: [], past: [] });
  const [expandedEventIndex, setExpandedEventIndex] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // For popup message

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((response) => {
        const allEvents = response.data;
        const currentDate = new Date();

        const categorizedEvents = {
          upcoming: [],
          current: [],
          past: [],
        };

        allEvents.forEach((event) => {
          const eventDate = new Date(event.date);

          if (eventDate > currentDate) {
            categorizedEvents.upcoming.push(event);
          } else if (eventDate.toDateString() === currentDate.toDateString()) {
            categorizedEvents.current.push(event);
          } else {
            categorizedEvents.past.push(event);
          }
        });

        setEvents(categorizedEvents);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const toggleEventDetails = (index) => {
    setExpandedEventIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleRegister = async (event) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to register for an event.");
        setSuccessMessage("");
        return;
      }

      const registrationData = {
        eventName: event.eventName,
        eventDate: event.date,
        eventDescription: event.eventDescription || "",
        department: event.department || "",
        time: event.time || "",
        location: event.location || "",
        isPaid: event.isPaid || "Unpaid",
        eventPic: event.eventPic || "",
      };

      const response = await axios.post(
        "http://localhost:5000/api/events/register",
        registrationData,
        { headers: { Authorization: token } }
      );

      if (response.status === 201) {
        // Task 1: Run the registration logic (already done via axios.post)
        // Task 2: Show success message and alert
        setSuccessMessage("You registered successfully, please check My Events");
        setError("");
        alert("You successfully registered,please check My_events "); // Immediate alert
        setTimeout(() => setSuccessMessage(""), 5000); // Clear popup after 5 seconds
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to register for the event."
      );
      setSuccessMessage("");
      console.error("Registration error:", err);
    }
  };

  const handleButtonClick = (event) => {
    handleRegister(event); // Task 1: Run the registration function
    // Task 2: Alert is handled within handleRegister on success
  };

  return (
    <div className="events-container">
      <h1>📅 Events Page</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
      <section className="event-section">
        <div className="tabs">
          <button
            className={activeTab === "upcoming" ? "active" : ""}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Events
          </button>
          <button
            className={activeTab === "current" ? "active" : ""}
            onClick={() => setActiveTab("current")}
          >
            Current Events
          </button>
          <button
            className={activeTab === "past" ? "active" : ""}
            onClick={() => setActiveTab("past")}
          >
            Past Events
          </button>
        </div>

        <div className="event-list">
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Events</h2>
          {events[activeTab].length > 0 ? (
            events[activeTab].map((event, index) => (
              <EventCard
                key={index}
                event={event}
                isExpanded={expandedEventIndex === index}
                onToggle={() => toggleEventDetails(index)}
                onRegister={() => handleButtonClick(event)} // Updated to use handleButtonClick
              />
            ))
          ) : (
            <p>No events available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const EventCard = ({ event, isExpanded, onToggle, onRegister }) => {
  return (
    <div className="event-card">
      <button className="openbutton" onClick={onToggle}>Click to open</button>
      <h3 className="event-name">
        {event.eventName}
      </h3>
      <p>Prize: {event.prize}</p>
      {isExpanded && (
        <div className="event-details">
          {event.eventPic && (
            <img
              src={`http://localhost:5000/uploads/${event.eventPic}`}
              alt={event.eventName}
              className="event-image"
            />
          )}
          <p><strong>Description:</strong> {event.eventDescription}</p>
          <p><strong>Department:</strong> {event.department}</p>
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Time:</strong> {event.time}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Status:</strong> {event.isPaid === "Paid" ? "Paid" : "Unpaid"}</p>
          <button className="register-button" onClick={onRegister}>
            Register
          </button>
        </div>
      )}
    </div>
  );
};

export default Events;