import { useState } from "react";
import { Note } from "./Note";
import "./App.css";

function App() {
  // state for storing notes
  // state for the notes array
  const [notes, setNotes] = useState([]);

  // state for the input value
  const [input, setInput] = useState("");

  // function to handle input change
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  // function to handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // create a new note object with the input value and a random color
    const newNote = {
      text: input,
      color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 75%)`,
    };
    // update the notes array with the new note
    setNotes((prevNotes) => [...prevNotes, newNote]);
    // clear the input value
    setInput("");
  };

  // function to handle note delete
  const handleDelete = (index) => {
    // filter out the note at the given index
    setNotes((prevNotes) => prevNotes.filter((note, i) => i !== index));
  };

  return (
    <div className="App">
      <h1>Sticky Notes</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="text-box"
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Write a note..."
          required
        />
        <button className="button" type="submit">
          Add
        </button>
      </form>
      <div className="notes-container">
        {notes.map((note, index) => (
          // render a Note component for each note in the array
          <Note
            key={index}
            index={index}
            text={note.text}
            color={note.color}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
