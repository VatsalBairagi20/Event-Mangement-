// import React, { useState, useEffect } from "react";
// import "./Dashboard.css"; // Import external CSS
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import EventList from "../Events/Events";
// import CreateEvent from "../CreateEvent/CreateEvent";
// import CreateAccount from "../CreateAccount/CreateAccount";
// import Community from "../Community/Community";
// import MyEvents from "../MyEvents/MyEvents";

// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const [activeComponent, setActiveComponent] = useState("events");
//   const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate("/login");
//         return;
//       }

//       try {
//         const response = await axios.get("http://localhost:5000/api/users/me", {
//           headers: { Authorization: token },
//         });
//         setUser(response.data);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//         alert("Session expired. Please log in again.");
//         localStorage.removeItem("token");
//         navigate("/login");
//       }
//     };

//     fetchUser();
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   if (!user) return <p>Loading...</p>;

//   const adminLinks = [
//     { key: "events", name: "Events" },
//     { key: "create-account", name: "Create Account" },
//     { key: "create-event", name: "Create Event" },
//     { key: "community", name: "Community" },
//   ];

//   const userLinks = [
//     { key: "events", name: "Events" },
//     { key: "my-events", name: "My Events" },
//     { key: "community", name: "Community" },
//   ];

//   const links = user.role === "admin" ? adminLinks : userLinks;

//   const renderComponent = () => {
//     switch (activeComponent) {
//       case "events":
//         return <EventList />;
//       case "create-account":
//         return <CreateAccount />;
//       case "create-event":
//         return <CreateEvent />;
//       case "community":
//         return <Community />;
//       case "my-events":
//         return <MyEvents />;
//       default:
//         return <EventList />;
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       {/* Top Navbar */}
//       <nav className="dashboard-navbar">
//         <h2 className="navbar-title">Dashboard</h2>
//         <div className="navbar-actions">
//           <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
//             ☰
//           </button>
//           {user.photo && <img src={user.photo} alt="User" className="user-photo" />}
//           <button onClick={handleLogout} className="logout-button">Logout</button>
//         </div>
//       </nav>

//       {/* Collapsible Sidebar */}
//       <nav className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
//         <ul className="sidebar-menu">
//           {links.map((link) => (
//             <li key={link.key}>
//               <button
//                 onClick={() => {
//                   setActiveComponent(link.key);
//                   setSidebarOpen(false); // Close sidebar on selection
//                 }}
//                 className={`menu-button ${activeComponent === link.key ? "active" : ""}`}
//               >
//                 {link.name}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Main Content */}
//       <div className="dashboard-main">
//         <header className="dashboard-header">
//           <div className="user-info">
//             <h2>Welcome, {user.name}</h2>
//             <p className="user-role">{user.role.toUpperCase()}</p>
//           </div>
//         </header>
//         <div className="dashboard-content">{renderComponent()}</div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect } from "react";
import "./Dashboard.css"; // Import external CSS
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EventList from "../Events/Events";
import CreateEvent from "../CreateEvent/CreateEvent";
import CreateAccount from "../CreateAccount/CreateAccount";
import Community from "../Community/Community";
import MyEvents from "../MyEvents/MyEvents";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState("events"); // Default page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: token },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return <p>Loading...</p>;

  const adminLinks = [
    { key: "events", name: "Events" },
    { key: "create-account", name: "Create Account" },
    { key: "create-event", name: "Create Event" },
    { key: "community", name: "Community" },
  ];

  const userLinks = [
    { key: "events", name: "Events" },
    { key: "my-events", name: "My Events" },
    { key: "community", name: "Community" },
  ];

  const links = user.role === "admin" ? adminLinks : userLinks;

  const renderComponent = () => {
    switch (activeComponent) {
      case "events":
        return <EventList />;
      case "create-account":
        return <CreateAccount />;
      case "create-event":
        return <CreateEvent />;
      case "community":
        return <Community />;
      case "my-events":
        return <MyEvents />;
      default:
        return <EventList />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar/Navbar */}
      <nav className="dashboard-sidebar">
        <h2 className="sidebar-title">Dashboard</h2>
        <ul className="sidebar-menu">
          {links.map((link) => (
            <li key={link.key}>
              <button
                onClick={() => setActiveComponent(link.key)}
                className={`menu-button ${activeComponent === link.key ? "active" : ""}`}
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="user-info">
            <h2>Welcome, {user.name}</h2>
            <p className="user-role">{user.role.toUpperCase()}</p>
          </div>
          <div className="user-actions">
            {user.photo && <img src={user.photo} alt="User" className="user-photo" />}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </header>

        {/* Dynamic Component Rendering */}
        <div className="dashboard-content">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;