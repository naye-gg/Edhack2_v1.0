import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function SimpleApp() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test React App</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<SimpleApp />);
}
