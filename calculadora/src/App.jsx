import { useState } from "react";
import "./App.css";

export default function App() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [tree, setTree] = useState(null);
  const [memory, setMemory] = useState(null); // Guarda el resultado de la última operación
  const [showModal, setShowModal] = useState(false);
  const [tokens, setTokens] = useState([]); 

  const handleNumber = (number) => {
    const newExpression = expression + number;
    setExpression(newExpression);
    setDisplay(newExpression);
  };

  const handleOperator = (op) => {
    if (expression === "") return;
    const lastChar = expression.slice(-1);
    if (["+", "-", "*", "/"].includes(lastChar)) {
      const newExpression = expression.slice(0, -1) + op;
      setExpression(newExpression);
      setDisplay(newExpression);
    } else {
      const newExpression = expression + op;
      setExpression(newExpression);
      setDisplay(newExpression);
    }
  };

  const handleParenthesis = (paren) => {
    const newExpression = expression + paren;
    setExpression(newExpression);
    setDisplay(newExpression);
  };

  const clear = () => {
    setDisplay("0");
    setExpression("");
    setTree(null);
  };

  const deleteLastChar = () => {
    if (expression.length > 0) {
      const newExpression = expression.slice(0, -1);
      setExpression(newExpression);
      setDisplay(newExpression || "0");
    }
  };

  const validateExpression = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression }),
      });
      const data = await response.json();

      if (response.ok) {
        const result = data.result;
        setDisplay(`${expression} = ${result}`);
        setMemory(result); // Guarda el resultado en memoria
      } else {
        setDisplay("Error");
      }
    } catch (error) {
      setDisplay("Error");
    }
  };

  const fetchTree = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression }),
      });
      const data = await response.json();

      if (response.ok) {
        setTree(data.image); // Guarda la imagen Base64 del árbol
      } else {
        setDisplay("Error");
      }
    } catch (error) {
      setDisplay("Error");
    }
  };

  const recallMemory = () => {
    if (memory !== null) {
      setDisplay(memory.toString());
      setExpression(memory.toString());
    }
  };

  const analyzeTokens = () => {
    const tokenList = [];
    const operators = {
      "+": "Operador suma",
      "-": "Operador resta",
      "*": "Operador multiplicación",
      "/": "Operador división",
    };

    for (const char of expression) {
      if (!isNaN(char)) {
        tokenList.push({ token: char, type: "Número entero" });
      } else if (operators[char]) {
        tokenList.push({ token: char, type: operators[char] });
      } else if (char === "(" || char === ")") {
        tokenList.push({ token: char, type: "Paréntesis" });
      } else {
        tokenList.push({ token: char, type: "Desconocido" });
      }
    }

    setTokens(tokenList);
    setShowModal(true);
  };

  return (
    <div className="container">
      <main>
        <div className="calculator">
          <div className="display">{display}</div>
          <div className="keypad">
            <button onClick={() => handleParenthesis("(")}>(</button>
            <button onClick={() => handleParenthesis(")")}>)</button>
            <button onClick={deleteLastChar}>DEL</button>
            <button onClick={clear}>C</button>

            <button onClick={() => handleNumber(7)}>7</button>
            <button onClick={() => handleNumber(8)}>8</button>
            <button onClick={() => handleNumber(9)}>9</button>
            <button onClick={() => handleOperator("/")}>/</button>

            <button onClick={() => handleNumber(4)}>4</button>
            <button onClick={() => handleNumber(5)}>5</button>
            <button onClick={() => handleNumber(6)}>6</button>
            <button onClick={() => handleOperator("*")}>*</button>

            <button onClick={() => handleNumber(1)}>1</button>
            <button onClick={() => handleNumber(2)}>2</button>
            <button onClick={() => handleNumber(3)}>3</button>
            <button onClick={() => handleOperator("-")}>-</button>

            <button onClick={() => handleNumber(0)}>0</button>
            <button onClick={() => handleNumber(".")}>.</button>
            <button onClick={validateExpression}>=</button>
            <button onClick={() => handleOperator("+")}>+</button>

            <button onClick={recallMemory}>MRC</button>
            <button onClick={fetchTree}>Tree</button>
            <button onClick={analyzeTokens}>Token</button>
            
          </div>
        </div>
      </main>
      <section className="tree-container">
        {tree ? (
          <img src={`data:image/png;base64,${tree}`} alt="Syntax Tree" />
        ) : (
          <p>No tree generated</p>
        )}
      </section>
       {/* Modal */}
       {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Tabla de Tokens</h2>
            <table>
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <tr key={index}>
                    <td>{token.token}</td>
                    <td>{token.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
