import React, { useEffect, useState } from "react";
import API from "../api"; // assumes you have Axios instance here
import { useNavigate } from "react-router-dom";


export default function Log() {
  const [logInput, setLogInput] = useState("");
  const [quantity, setQuantity] = useState("");
  const [savedFoods, setSavedFoods] = useState([]);
  const [nutritionResult, setNutritionResult] = useState([]);
  const [globalFoods, setGlobalFoods] = useState([]);
  const todayDate = new Date().toLocaleDateString();
  const [searchResults, setSearchResults] = useState([]);



  

useEffect(() => {
  const fetchSavedFoods = async () => {
    try {
      const res = await API.get("/saved-foods", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSavedFoods(res.data);
    } catch (err) {
      console.error("Failed to fetch saved foods:", err);
    }
  };

  const fetchDailyLog = async () => {
    try {
  const res = await API.get("/auth/daily-log", {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const logsWithDateTime = res.data.map((item) => {
  const timestamp = Number(item.logId);
  const logDateObj = !isNaN(timestamp) ? new Date(timestamp) : new Date();

  const logDate = logDateObj.toLocaleDateString();
  const logTime = logDateObj.toLocaleTimeString();
  return { ...item, logDate, logTime };
});

setNutritionResult(logsWithDateTime);


    } catch (err) {
      console.error("Failed to fetch daily log:", err);
    }
  };

  fetchSavedFoods();
  fetchDailyLog();
  fetchGlobalFoods(); // ✅ add this
}, []);







const handleSubmit = async (e) => {
  e.preventDefault();

  if (!logInput || !quantity) {
    alert("Please enter both food name and quantity");
    return;
  }

const food =
  savedFoods.find((item) => item.name.toLowerCase() === logInput.toLowerCase()) ||
  globalFoods.find((item) => item.name.toLowerCase() === logInput.toLowerCase());


  if (!food) {
    alert("Food not found in your saved foods!");
    return;
  }

  const qty = parseFloat(quantity);
  const totalCalories = food.calories * qty;
  const totalProtein = food.protein * qty;
  const totalCarbs = food.carbs * qty;
  const totalFat = food.fat * qty;
  const totalFiber = food.fiber * qty;

  const now = new Date();
const logId = now.getTime();
const logDateObj = new Date(logId);

// Extract date and time as strings
const logDate = logDateObj.toLocaleDateString();
const logTime = logDateObj.toLocaleTimeString();

setNutritionResult((prev) => [
  ...prev,
  {
    name: food.name,
    quantity: qty,
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    fiber: totalFiber,
    logId,
    logDate,
    logTime,
  },
]);


  const createdAt = now.toISOString(); // or toLocaleString() if you prefer



  try {
    await API.post(
      "/auth/log-food",
      {
        name: food.name,
        quantity: qty,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        logId,
        createdAt,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("Food logged successfully!");
    setLogInput("");
    setQuantity("");
  } catch (err) {
    console.error("Error logging food:", err);
    alert("Failed to log food");
  }
};

const fetchGlobalFoods = async () => {
  try {
    const res = await API.get("/global-foods"); // No auth required
    setGlobalFoods(res.data);
  } catch (err) {
    console.error("Failed to fetch global foods:", err);
  }
};

const navigate = useNavigate();













const handleReset = async () => {
  if (!window.confirm("Are you sure you want to reset current values to 0?")) return;

  try {
    await API.post(
      "/auth/reset-current",
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    alert("Current values reset successfully!");
  } catch (err) {
    console.error("Failed to reset current values:", err);
    alert("Error resetting values.");
  }
};

const handleSearch = () => {
  if (!logInput.trim()) {
    alert("Please enter a food name to search");
    return;
  }

  const term = logInput.toLowerCase();
  const matches = [
    ...savedFoods.filter((f) => f.name.toLowerCase().includes(term)),
    ...globalFoods.filter((f) => f.name.toLowerCase().includes(term)),
  ];

  if (matches.length === 0) {
    alert("No matching foods found");
  }

  setSearchResults(matches);
};

const handleRemoveItem = async (item, indexToRemove) => {
  if (!window.confirm(`Remove ${item.name} from today's log?`)) return;

  try {
    // Step 1: Subtract from current values
    await API.post(
      "/auth/log-food",
      {
        name: item.name,
        quantity: -item.quantity,
        calories: -item.calories,
        protein: -item.protein,
        carbs: -item.carbs,
        fat: -item.fat,
        fiber: -item.fiber,
        logId: item.logId || Date.now().toString(),
        createdAt: new Date().toLocaleString(),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // ✅ Step 2: Remove from the dailyLog in DB
    await API.post(
      "/auth/remove-food-log",
      { logId: item.logId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Step 3: Update UI state
    setNutritionResult((prev) => prev.filter((_, i) => i !== indexToRemove));

    alert(`${item.name} removed and values updated!`);
  } catch (err) {
    console.error("Error removing item:", err);
    alert("Failed to remove item.");
  }
};










  

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="log" style={styles.label}>Add Your Log</label>
          <input
            type="text"
            id="log"
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            placeholder="Enter your log"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="quantity" style={styles.label}>Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Submit</button>

        








          <button type="button" onClick={handleReset} style={{ ...styles.button, backgroundColor: "#e74c3c", color: "white" }}>
            Reset Current
          </button>

          <button
      type="button"
      onClick={handleSearch}
      style={{ ...styles.button, backgroundColor: "#3498db", color: "#fff" }}
        >
      Search
      </button>

{/* Show search results */}
{searchResults.length > 0 && (
  <div style={{ marginTop: "1rem" }}>
    <h4>Search Results:</h4>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {searchResults.map((food) => (
        <button
          key={food._id}
          onClick={() => setLogInput(food.name)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            backgroundColor: "#f5f5f5",
            cursor: "pointer",
          }}
        >
          {food.name}
        </button>
      ))}
    </div>
  </div>
)}

<div style={styles.navButtonContainer}>
  <button
    style={styles.navButton}
    onClick={() => navigate("/home")}
    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#333"}
    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#100c08"}
  >
    Home
  </button>
  <button
    style={styles.navButton}
    onClick={() => navigate("/savedfoods")}
    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#333"}
    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#100c08"}
  >
    Saved Foods
  </button>
</div>








      </form>

{nutritionResult.length > 0 && (
  <div style={{ marginTop: "2rem", overflowX: "auto" }}>
    <h3>Nutrition Summary</h3>
    <table className="nutrition-table" style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr style={{ backgroundColor: "#f0f0f0" }}>
          <th style={styles.th}>#</th>
          <th style={styles.th}>Food</th>
          <th style={styles.th}>Qty</th>
          <th style={styles.th}>Calories (kcal)</th>
          <th style={styles.th}>Protein (g)</th>
          <th style={styles.th}>Carbs (g)</th>
          <th style={styles.th}>Fat (g)</th>
          <th style={styles.th}>Fiber (g)</th>
          <th style={styles.th}>Date & Time</th> 

        </tr>
      </thead>
      <tbody>
    {nutritionResult
    .filter(item => item.logDate === todayDate)
    .map((item, index) => (
      <tr
          key={index}
          style={{
          textAlign: "center",
          borderBottom: "1px solid #ccc",
          cursor: "pointer",
          backgroundColor: "#fff",
          transition: "background 0.2s",
          }}
        onClick={() => handleRemoveItem(item, index)}

        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
      >
<td style={styles.td} data-label="#"> {index + 1} </td>
<td style={styles.td} data-label="Food"> {item.name} </td>
<td style={styles.td} data-label="Qty"> {item.quantity} </td>
<td style={styles.td} data-label="Calories (kcal)"> {Number(item.calories).toFixed(1)} </td>
<td style={styles.td} data-label="Protein (g)"> {Number(item.protein).toFixed(1)} </td>
<td style={styles.td} data-label="Carbs (g)"> {Number(item.carbs).toFixed(1)} </td>
<td style={styles.td} data-label="Fat (g)"> {Number(item.fat).toFixed(1)} </td>
<td style={styles.td} data-label="Fiber (g)"> {Number(item.fiber).toFixed(1)} </td>
<td style={styles.td} data-label="Date & Time"> {item.logDate && item.logTime ? `${item.logDate} | ${item.logTime}` : "-"} </td>




      </tr>
  ))}

      </tbody>
    </table>
  </div>
)}


            <h3 style={{ marginTop: "2rem" }}>Your Saved Foods</h3>         

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {savedFoods.map((food) => (

                      
                <button
                    key={food._id}
                    onClick={() => setLogInput(food.name)}

                    style={{
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    backgroundColor: "#f5f5f5",
                    cursor: "pointer",
                    }}
                >
                    {food.name}
                </button>
                ))}
            </div>

            

            <h3 style={{ marginTop: "2rem" }}>Global Foods</h3>
<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
  {globalFoods.map((food) => (
    <button
      key={food._id}
      onClick={() => setLogInput(food.name)}
      style={{
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        backgroundColor: "#e0f7fa",
        cursor: "pointer",
      }}
    >
      {food.name}
    </button>
  ))}
</div>


    </div>
    
  );
}

const styles = {
    container: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f8f8ff",
    minHeight: "100vh",
  },
  form: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "700px",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  // ... other styles
  navButton: {
    padding: "0.6rem 1.2rem",
    fontSize: "1rem",
    backgroundColor: "#100c08",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginRight: "10px",
  },
  navButtonHover: {
    backgroundColor: "#333333",
  },
  navButtonContainer: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  container: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f8f8ff",
    minHeight: "100vh",
  },
  form: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "700px",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "0.3rem",
    color: "#333",
  },
  input: {
    padding: "0.7rem",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.7rem 1.2rem",
    fontSize: "1rem",
    backgroundColor: "#100c08",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.3s",
    marginRight: "10px",
  },
  th: {
    padding: "12px",
    borderBottom: "2px solid #ccc",
    fontWeight: "bold",
    textAlign: "center",
  },
  td: {
    padding: "10px",
    textAlign: "center",
  },
  foodButton: {
    padding: "8px 14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    transition: "0.2s",
  },
  globalFoodButton: {
    padding: "8px 14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    backgroundColor: "#e0f7fa",
    cursor: "pointer",
    transition: "0.2s",
  },
};
