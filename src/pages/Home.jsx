import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Home() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "M",
    height: "",
    weight: "",
    goal: "0.25",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await API.get("/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(res.data);
      } catch (error) {
        console.error("Unauthorized or error fetching user data", error);
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  const calculateAndUpdateTargets = async () => {
    const { age, gender, height, weight, goal } = formData;
    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const goalNum = parseFloat(goal);

    const BMR =
      gender === "M"
        ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
        : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;

    const activityMultiplier = 1.375;
    const TDEE = BMR * activityMultiplier;

    const CalorieGoal =
      goalNum > 0 ? TDEE + 250 : goalNum < 0 ? TDEE - 250 : TDEE;

    const protein = Math.round(weightNum * 2);
    const proteinCal = protein * 4;
    const fatCal = CalorieGoal * 0.25;
    const fat = Math.round(fatCal / 9);
    const carbs = Math.round((CalorieGoal - (proteinCal + fatCal)) / 4);
    const fiber = 30;

    setUserData((prev) => ({
      ...prev,
      calories: { ...prev.calories, target: Math.round(CalorieGoal) },
      protein: { ...prev.protein, target: protein },
      carbs: { ...prev.carbs, target: carbs },
      fat: { ...prev.fat, target: fat },
      fiber: { ...prev.fiber, target: fiber },
    }));

    setShowForm(false);

    try {
      await API.post(
        "/auth/update-targets",
        {
          calories: Math.round(CalorieGoal),
          protein,
          carbs,
          fat,
          fiber,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (err) {
      console.error("Error updating targets", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleLog = () => {
    navigate("/log");
  };

  const handleSavedFoods = () => {
    navigate("/savedfoods");
  };

  if (!userData) return <p className="loading">Loading...</p>;

  const { name, calories, protein, carbs, fat, fiber } = userData;

  const renderNutrient = (label, data) => (
    <p>
      {label}: {(data?.current ?? 0).toFixed(2)} / {(data?.target ?? 0).toFixed(2)} –{" "}
      {data?.current === data?.target
        ? "Target achieved!"
        : data?.current < data?.target
        ? "Still have to eat more."
        : "You've eaten more than the target!"}
    </p>
  );

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h1 className="home-title">Welcome, {name}!</h1>

        <div className="nutrition-stats">
          {renderNutrient("Calories (Cal)", calories)}
          {renderNutrient("Protein (g)", protein)}
          {renderNutrient("Carbs (g)", carbs)}
          {renderNutrient("Fat (g)", fat)}
          {renderNutrient("Fiber (g)", fiber)}
        </div>

        <div className="button-group">
          <button onClick={() => setShowForm(!showForm)} className="btn">
            {showForm ? "Close Calculator" : "Calculate"}
          </button>
          <button onClick={handleLog} className="btn">
            Log your food
          </button>
          <button onClick={handleSavedFoods} className="btn">
            Saved Foods
          </button>
          <button onClick={handleLogout} className="btn logout-btn">
            Logout
          </button>
        </div>

        {showForm && (
          <div className="form-section">
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
            />
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            <input
              type="number"
              name="height"
              placeholder="Height (cm)"
              value={formData.height}
              onChange={handleChange}
            />
            <input
              type="number"
              name="weight"
              placeholder="Weight (kg)"
              value={formData.weight}
              onChange={handleChange}
            />
            <select name="goal" value={formData.goal} onChange={handleChange}>
              <option value="-0.25">Lose 0.25kg/week</option>
              <option value="0">Maintain weight</option>
              <option value="0.25">Gain 0.25kg/week</option>
            </select>
            <button onClick={calculateAndUpdateTargets} className="btn calculate-btn">
              Calculate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
