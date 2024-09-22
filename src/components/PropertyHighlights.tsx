"use client";

import { useState, useEffect, useCallback } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { FaGripLines } from 'react-icons/fa';

// Debounce utility to limit PUT calls when typing
const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

interface Highlight {
  id: string;
  text: string;
  position: number;
}

export default function Home() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    // Fetch highlights when component loads
    const fetchHighlights = async () => {
      const response = await fetch('http://localhost:3000/highlights');
      console.log('response', response)
      const data = await response.json();
      setHighlights(data);
    };

    fetchHighlights();
  }, []);

  // Add new empty row
  const addHighlight = async () => {
    const newHighlight: Highlight = { id: `${highlights.length + 1}`, text: '', position: highlights.length };
    
    // Add highlight to the backend
    await fetch('http://localhost:3000/highlights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHighlight),
    });

    // Update UI
    setHighlights([...highlights, newHighlight]);
  };

  // Delete a specific row
  const deleteHighlight = async (id: string) => {
    await fetch(`http://localhost:3000/highlights/${id}`, {
      method: 'DELETE',
    });
    
    setHighlights(highlights.filter((highlight) => highlight.id !== id));
  };

  // Handle drag and drop to reorder highlights
  const handleDrop = async (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const updatedHighlights = [...highlights];
    const [movedItem] = updatedHighlights.splice(draggedItemIndex, 1);
    updatedHighlights.splice(index, 0, movedItem);

    // Update UI
    setHighlights(updatedHighlights);

    // Update backend with the new positions
    updatedHighlights.forEach(async (item, i) => {
      await fetch(`http://localhost:3000/highlights/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, position: i }),
      });
    });

    setDraggedItemIndex(null); // Reset dragged item index after drop
  };

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  // Debounced text update
  const updateText = useCallback(
    debounce(async (id: string, text: string) => {
      await fetch(`http://localhost:3000/highlights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
    }, 1000),
    []
  );

  return (
    <div className="container">
      <div className="header">
        <h3>Property highlights</h3>
        <button onClick={addHighlight} className="add-button">
          + Add Highlight
        </button>
      </div>

      <div>
        {highlights.map(({ id, text }, index) => (
          <div
            key={id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()} // Necessary to allow drop
            onDrop={() => handleDrop(index)}
            className="highlight-row"
          >
            <span className="drag-handle">
              <FaGripLines />
            </span>
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setHighlights(
                  highlights.map((item) =>
                    item.id === id ? { ...item, text: e.target.value } : item
                  )
                );
                updateText(id, e.target.value); // Debounced API call
              }}
              className="highlight-input"
            />
            <button onClick={() => deleteHighlight(id)} className="delete-button">
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        /* Add your styles here based on the provided design */
        .container {
          padding: 20px;
          width: 100%;
          margin: auto;
          background-color: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        h3 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .highlight-row {
          display: flex;
          align-items: center;
          background-color: #f9f9f9;
          border-radius: 5px;
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid #e0e0e0;
          cursor: move; /* Change cursor to indicate draggable */
        }
        .highlight-input {
          flex-grow: 1;
          padding: 8px;
          font-size: 14px;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          margin-right: 10px;
        }
        .drag-handle {
          display: flex;
          align-items: center;
          padding-right: 10px;
          color: #888;
          cursor: grab;
        }
        .delete-button {
          background: none;
          border: none;
          color: #888;
          font-size: 18px;
          cursor: pointer;
        }
        .add-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #6c63ff;
          color: white;
          padding: 8px 12px;
          font-size: 14px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
        }
        .add-button:hover {
          background-color: #5548c8;
        }
      `}</style>
    </div>
  );
}
