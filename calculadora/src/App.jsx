import { useState } from 'react';
import './App.css';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [tree, setTree] = useState(null);

  const handleNumber = (number) => {
    const newExpression = expression + number;
    setExpression(newExpression);
    setDisplay(newExpression); // Muestra la expresión completa en tiempo real
  };

  const handleOperator = (op) => {
    if (expression === '') return; // Evita operadores al inicio
    const lastChar = expression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
      // Reemplaza el operador si ya hay uno al final
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
    setDisplay('0');
    setExpression('');
    setTree(null);
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
        setDisplay(`${expression} = ${data.result}`);
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
        setTree(data.tree);
      } else {
        setDisplay("Error");
      }
    } catch (error) {
      setDisplay("Error");
    }
  };

  const renderTree = (node) => {
    if (!node) return null;

    return (
      <div className="node">
        <div className="node-content">{node.value}</div>
        <div className="node-children">
          {node.children.map((child, index) => (
            <div key={index}>{renderTree(child)}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <main>
        <div className="calculator">
          <div className="display">{display}</div>
          <div className="keypad">
            <button onClick={() => handleParenthesis('(')}>(</button>
            <button onClick={() => handleParenthesis(')')}>)</button>
            <button onClick={clear}>C</button>
            <button onClick={() => handleOperator('/')}>/</button>

            <button onClick={() => handleNumber(7)}>7</button>
            <button onClick={() => handleNumber(8)}>8</button>
            <button onClick={() => handleNumber(9)}>9</button>
            <button onClick={() => handleOperator('*')}>*</button>

            <button onClick={() => handleNumber(4)}>4</button>
            <button onClick={() => handleNumber(5)}>5</button>
            <button onClick={() => handleNumber(6)}>6</button>
            <button onClick={() => handleOperator('-')}>-</button>

            <button onClick={() => handleNumber(1)}>1</button>
            <button onClick={() => handleNumber(2)}>2</button>
            <button onClick={() => handleNumber(3)}>3</button>
            <button onClick={() => handleOperator('+')}>+</button>

            <button onClick={() => handleNumber(0)}>0</button>
            <button onClick={() => handleNumber('.')}>.</button>
            <button onClick={validateExpression}>=</button>
            <button onClick={fetchTree}>Tree</button>
          </div>
        </div>
      </main>
      <section className="tree-container">
        {tree ? renderTree(tree) : <p>No tree generated</p>}
      </section>
    </div>
  );
}
