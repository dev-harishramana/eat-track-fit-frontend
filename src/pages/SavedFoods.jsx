import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function SavedFoods() {
  const [showForm, setShowForm] = useState(false);
  const [foodData, setFoodData] = useState({
    name: "",
    quantity: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });

  const [savedFoods, setSavedFoods] = useState([]);
  const [message, setMessage] = useState(""); // ✅ For notification messages
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFoodData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchSavedFoods();
  }, []);

  const fetchSavedFoods = async () => {
    try {
      const res = await API.get("/saved-foods", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSavedFoods(res.data);
    } catch (err) {
      console.error("Failed to fetch saved foods:", err);
      showMessage("Failed to load saved foods.", "error");
    }
  };

  const handleSave = async () => {
    try {
      await API.post("/saved-foods/add", foodData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      showMessage("Food saved successfully!", "success");
      setShowForm(false);
      setFoodData({
        name: "",
        quantity: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      });
      fetchSavedFoods();
    } catch (err) {
      console.error("Error saving food:", err.response?.data || err.message);
      showMessage("Error saving food.", "error");
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000); // Auto-hide after 3 seconds
  };

  return (
    <div className="saved-foods-container">
      <h2 className="title">Saved Foods</h2>

      {/* ✅ Notification box */}
      {message && (
        <div
          style={{
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            backgroundColor:
              messageType === "success" ? "#4caf50" : "#f44336",
            color: "white",
          }}
        >
          {message}
        </div>
      )}

      <div className="nav-buttons">
        <button onClick={() => navigate("/home")}>Home</button>
        <button onClick={() => navigate("/log")}>Log</button>
      </div>

      <button className="add-btn" onClick={() => setShowForm(true)}>
        + Add Food
      </button>

      {showForm && (
        <div className="food-form">
          {["name", "quantity", "calories", "protein", "carbs", "fat", "fiber"].map((field) => (
            <div className="form-group" key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                type={field === "name" ? "text" : "number"}
                name={field}
                value={foodData[field]}
                onChange={handleChange}
                placeholder={field === "calories" ? "in grams" : ""}
              />
            </div>
          ))}
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      )}

      <div className="saved-foods-list" style={{ marginTop: "2rem" }}>
        <h3>Your Saved Foods</h3>
        {savedFoods.length === 0 ? (
          <p>No saved foods found.</p>
        ) : (
          <ul>
            {savedFoods.map((food) => (
              <li key={food._id}>
                <strong>{food.name}</strong> — Qty: {food.quantity}, Calories: {food.calories}, Protein: {food.protein}, Carbs: {food.carbs}, Fat: {food.fat}, Fiber: {food.fiber}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
