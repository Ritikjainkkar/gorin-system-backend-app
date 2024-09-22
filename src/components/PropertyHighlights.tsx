"use client";

import { useState, useEffect, useCallback } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { FaEllipsisV } from 'react-icons/fa'; // Icon for 6 dots
import {
  getHighlights,
  addHighlight as apiAddHighlight,
  deleteHighlight as apiDeleteHighlight,
  updateHighlightPosition,
  updateHighlightText,
} from '../api/highlights';
import { debounce } from '@/util/debounce';

interface Highlight {
  _id: string; // MongoDB uses _id instead of id
  text: string;
  position: number;
}

export default function Home() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For fetching highlights
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false); // Freeze screen on any action
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // For updating a specific highlight
  const [isDeleting,] = useState<string | null>(null); // For deleting a specific highlight

  useEffect(() => {
    const fetchHighlights = async () => {
      setIsLoading(true);
      try {
        const data = await getHighlights();
        setHighlights(data);
      } catch (error) {
        console.error('Error fetching highlights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  // Add new empty row
  const addHighlight = async () => {
    setIsActionInProgress(true);
    const newHighlight: Omit<Highlight, '_id'> = {
      text: '',
      position: highlights.length,
    };

    try {
      const createdHighlight = await apiAddHighlight(newHighlight);
      setHighlights([...highlights, createdHighlight]);
    } catch (error) {
      console.error('Error adding highlight:', error);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Delete a specific row
  const deleteHighlight = async (_id: string) => {
    setIsActionInProgress(true);
    try {
      await apiDeleteHighlight(_id);
      setHighlights(highlights.filter((highlight) => highlight._id !== _id));
    } catch (error) {
      console.error('Error deleting highlight:', error);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle drag and drop to reorder highlights
  const handleDrop = async (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const updatedHighlights = [...highlights];
    const [movedItem] = updatedHighlights.splice(draggedItemIndex, 1);
    updatedHighlights.splice(index, 0, movedItem);

    setHighlights(updatedHighlights);

    updatedHighlights.forEach(async (item, i) => {
      setIsUpdating(item._id); // Set updating state for each item being updated
      try {
        await updateHighlightPosition(item._id, i);
      } catch (error) {
        console.error('Error updating highlight position:', error);
      } finally {
        setIsUpdating(null);
      }
    });

    setDraggedItemIndex(null);
  };

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  // Debounced text update
  const updateText = useCallback(
    debounce(async (_id: string, text: string): Promise<void> => {
      setIsUpdating(_id);
      try {
        await updateHighlightText(_id, text);
      } catch (error) {
        console.error('Error updating highlight text:', error);
      } finally {
        setIsUpdating(null);
      }
    }, 1000),
    []
  );
  

  return (
    <div className="container">
      {isActionInProgress && <div className="overlay">Loading...</div>}

      <div className="header">
        <h3>Property Highlights</h3>
        <button onClick={addHighlight} className="add-button" disabled={isActionInProgress}>
          {isActionInProgress ? 'Processing...' : '+ Add Highlight'}
        </button>
      </div>
      <hr />

      {isLoading ? (
        <p>Loading highlights...</p>
      ) : (
        <div>
          {highlights.map(({ _id, text }, index) => (
            <div key={_id} draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(index)} className="highlight-row">
              <span className="drag-handle">
                <FaEllipsisV /> {/* 6-dot icon */}
              </span>
              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setHighlights(
                    highlights.map((item) =>
                      item._id === _id ? { ...item, text: e.target.value } : item
                    )
                  );
                  updateText(_id, e.target.value); // Debounced API call
                }}
                className="highlight-input"
                disabled={isUpdating === _id || isActionInProgress}
              />
              <button onClick={() => deleteHighlight(_id)} className="delete-button" disabled={isDeleting === _id || isActionInProgress}>
                {isDeleting === _id ? 'Deleting...' : <FiTrash2 />}
              </button>
            </div>
          ))}
        </div>
      )}
      

      <style jsx>{`
  hr {
    border: 0;
    height: 1px;
    background: #e0e0e0;
    margin: 10px 0;
  }
  .container {
    padding: 32px;
    width: 100%;
    margin: auto;
    background-color: white;
    position: relative;
  }
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #6c63ff;
    z-index: 10;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  h3 {
    color: #7261FF;
    font-size: 22px;
    font-weight: 600;
  }
  .highlight-row {
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 12px;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .highlight-input {
    flex-grow: 1;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-left: 16px;
    margin-right: 12px;
    transition: border-color 0.2s ease-in-out;
  }
  .highlight-input:focus {
    border-color: #7261FF;
    outline: none;
  }
  .drag-handle {
    display: flex;
    align-items: center;
    padding-right: 12px;
    color: #888;
    cursor: grab;
  }
  .delete-button {
    background: none;
    border: none;
    color: #FF6B6B;
    font-size: 18px;
    cursor: pointer;
    transition: color 0.2s ease-in-out;
  }
  .delete-button:hover {
    color: #ff4949;
  }
  .add-button {
    background-color: #7261FF;
    color: white;
    padding: 10px 16px;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s ease-in-out;
  }
  .add-button:hover {
    background-color: #5548c8;
  }
  .line-break {
    width: 100%;
    border: none;
    border-bottom: 1px solid #e0e0e0;
    margin: 0;
    margin-top: 12px;
  }
`}</style>

    </div>
  );
}
