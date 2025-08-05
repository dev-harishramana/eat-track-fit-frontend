import { useState } from "react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFoodData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      const res = await API.post("/saved-foods/add", foodData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Food saved successfully!");
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
    } catch (err) {
      console.error("Error saving food:", err.response?.data || err.message);
      alert("Error saving food.");
    }
  };

  return (
    <div className="saved-foods-container">
      <h2 className="title">Saved Foods</h2>

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
    </div>
  );
}
