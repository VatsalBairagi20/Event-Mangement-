import React from "react";
import "./Community.css";

const Community = () => {
  return (
    <div className="community-container">
      <h1 className="community-title">🌍 Community Page</h1>
      <div className="community-wip">
        <p className="community-wip-text">Work in Progress</p>
        <div className="community-wip-dots">
          <span className="community-dot"></span>
          <span className="community-dot"></span>
          <span className="community-dot"></span>
        </div>
      </div>
    </div>
  );
};

export default Community;