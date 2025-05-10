from flask import Flask, request, jsonify, send_from_directory
from flask_pymongo import PyMongo
import jwt
import datetime
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})  # Restrict to frontend origin
from flask_cors import CORS
CORS(app, origins="*")  # Allow all (for testing)

# Database Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/ReactAuth"
mongo = PyMongo(app)
app.config["SECRET_KEY"] = "your_secret_key"  # Replace with a secure key

@app.route("/api/users/create", methods=["POST"])
def create_account():
    try:
        # Ensure JSON data is present
        if not request.is_json:
            return jsonify({"message": "Invalid request: JSON data required"}), 400

        data = request.get_json()
        enrollment = data.get("enrollment")
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "user")  # Default to "user"

        # Validate required fields
        if not all([enrollment, name, email, password]):
            return jsonify({"message": "All fields (enrollment, name, email, password) are required!"}), 400

        # Additional validation (optional)
        if "@" not in email or "." not in email:
            return jsonify({"message": "Invalid email format!"}), 400
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters!"}), 400

        # Check if the user already exists
        existing_user = mongo.db.users.find_one({"enrollment": enrollment})
        if existing_user:
            return jsonify({"message": "User with this enrollment already exists!"}), 400

        # Insert the new user into the database (no hashing)
        new_user = {
            "enrollment": enrollment,
            "name": name,
            "email": email,
            "password": password,  # Store password as plain text
            "role": role
        }
        result = mongo.db.users.insert_one(new_user)

        # Verify insertion
        if result.inserted_id:
            return jsonify({"message": "Account created successfully!"}), 201
        else:
            return jsonify({"message": "Failed to create account"}), 500

    except ValueError as ve:
        return jsonify({"message": f"Invalid JSON data: {str(ve)}"}), 400
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route("/api/users/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        enrollment = data.get("enrollment")
        password = data.get("password")
        
        if not enrollment or not password:
            return jsonify({"message": "Enrollment and password are required!"}), 400
        
        user = mongo.db.users.find_one({"enrollment": enrollment})
        
        # Compare plain-text password directly
        if user and user["password"] == password:
            token = jwt.encode({
                "enrollment": enrollment,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }, app.config["SECRET_KEY"], algorithm="HS256")
            
            return jsonify({
                "token": token,
                "redirect": "/dashboard",
                "user": {
                    "name": user.get("name"),
                    "role": user.get("role"),
                    "photo": user.get("photo", "")
                }
            }), 200
        
        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route("/api/users/me", methods=["GET"])
def get_user():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token is missing!"}), 401
    
    try:
        decoded_token = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        enrollment = decoded_token["enrollment"]
        user = mongo.db.users.find_one({"enrollment": enrollment}, {"_id": 0, "password": 0})
        if user:
            return jsonify(user), 200
        return jsonify({"message": "User not found"}), 404
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token!"}), 401

@app.route("/api/events/create", methods=["POST"])
def create_event():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token is missing!"}), 401

    try:
        decoded_token = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        enrollment = decoded_token["enrollment"]
        user = mongo.db.users.find_one({"enrollment": enrollment})

        if not user or user["role"] != "admin":
            return jsonify({"message": "Unauthorized"}), 403

        event_data = request.form.to_dict()
        event_pic = request.files.get("eventPic")

        uploads_dir = "./uploads"
        if not os.path.exists(uploads_dir):
            os.makedirs(uploads_dir)

        if event_pic:
            event_pic_filename = f"{event_data['eventName']}_{datetime.datetime.utcnow().timestamp()}.jpg"
            event_pic_path = os.path.join(uploads_dir, event_pic_filename)
            event_pic.save(event_pic_path)
            event_data["eventPic"] = event_pic_filename

        event_data["created_by"] = enrollment
        event_data["isPaid"] = event_data.get("isPaid", "Unpaid")
        mongo.db.CreatedEvent.insert_one(event_data)

        return jsonify({"message": "Event created successfully!"}), 201
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token!"}), 401
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route("/api/events", methods=["GET"])
def get_events():
    try:
        events = list(mongo.db.CreatedEvent.find({}, {"_id": 0}))
        for event in events:
            if "eventDate" in event:
                event["date"] = event["eventDate"]
        return jsonify(events), 200
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route("/api/events/register", methods=["POST"])
def register_event():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token is missing!"}), 401

    try:
        # Decode token to get user enrollment
        decoded_token = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        enrollment = decoded_token["enrollment"]

        # Get event data from request
        data = request.json
        event_name = data.get("eventName")
        event_date = data.get("eventDate")
        event_description = data.get("eventDescription", "")
        department = data.get("department", "")
        time = data.get("time", "")
        location = data.get("location", "")
        is_paid = data.get("isPaid", "Unpaid")
        event_pic = data.get("eventPic", "")

        # Validate required fields
        if not event_name or not event_date:
            return jsonify({"message": "Event name and date are required!"}), 400

        # Check if user is already registered for this event
        existing_registration = mongo.db.RegisteredEvents.find_one({
            "enrollment": enrollment,
            "eventName": event_name
        })
        if existing_registration:
            return jsonify({"message": "You are already registered for this event!"}), 400

        # Save registration to RegisteredEvents collection
        registration = {
            "enrollment": enrollment,
            "eventName": event_name,
            "eventDate": event_date,
            "eventDescription": event_description,
            "department": department,
            "time": time,
            "location": location,
            "isPaid": is_paid,
            "eventPic": event_pic,
            "registeredAt": datetime.datetime.utcnow()
        }
        mongo.db.RegisteredEvents.insert_one(registration)

        return jsonify({"message": "Successfully registered for the event!"}), 201
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token!"}), 401
    except Exception as e:
        return jsonify({"message": f"Error registering event: {str(e)}"}), 500

# New endpoint to get registered events per user
@app.route("/api/users/registered-events", methods=["GET"])
def get_registered_events():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Token is missing!"}), 401

    try:
        # Decode token to get user enrollment
        decoded_token = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        enrollment = decoded_token["enrollment"]

        # Fetch all registrations for this user
        user_events = list(mongo.db.RegisteredEvents.find({"enrollment": enrollment}, {"_id": 0}))

        # Return user-specific event details
        return jsonify({
            "enrollment": enrollment,
            "registeredEvents": user_events,
            "eventCount": len(user_events)
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expired!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token!"}), 401
    except Exception as e:
        return jsonify({"message": f"Error fetching registered events: {str(e)}"}), 500

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("./uploads", filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Ensure it runs on port 5000 to match frontend