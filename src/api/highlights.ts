const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getHighlights = async () => {
  const response = await fetch(`${API_URL}/highlights`);
  if (!response.ok) {
    throw new Error('Failed to fetch highlights');
  }
  return response.json();
};

export const addHighlight = async (highlight: { text: string; position: number }) => {
  const response = await fetch(`${API_URL}/highlights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(highlight),
  });
  if (!response.ok) {
    throw new Error('Failed to add highlight');
  }
  return response.json(); // Returns the newly created highlight with its _id
};

export const deleteHighlight = async (_id: string) => {
  const response = await fetch(`${API_URL}/highlights/${_id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete highlight');
  }
};

export const updateHighlightPosition = async (_id: string, position: number) => {
  const response = await fetch(`${API_URL}/highlights/${_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position }),
  });
  if (!response.ok) {
    throw new Error('Failed to update highlight position');
  }
};

export const updateHighlightText = async (_id: string, text: string) => {
  const response = await fetch(`${API_URL}/highlights/${_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error('Failed to update highlight text');
  }
};
