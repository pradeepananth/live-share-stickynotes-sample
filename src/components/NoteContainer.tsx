// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/prop-types */

import { useState } from "react";
import { Note } from "./Note";
import "./noteContainer.css";
import React from "react";
import { useSharedObjects } from "../sharedObjectHooks/useSharedObjects";
import { LiveSharePage } from "./LiveSharePage";
import { useNotesMap } from "../sharedObjectHooks/useNotesMap";

interface NoteContainerProps {
  apiEndpoint: string;
  meetingJoinUrl: string;
  skypeMri: string;
  userToken: string;
}

export const NoteContainer = (props: NoteContainerProps) => {
  // state for storing notes
  // state for the notes array
  const { container, notesMap } = useSharedObjects(props);

  const { started, notes, addNote, removeNote } = useNotesMap(notesMap);
  const [count, setCount] = useState(0);
  const increment = () => {
    setCount(count + 1);
  };
  // state for the input value
  const [input, setInput] = useState("");

  // function to handle input change
  const handleChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInput(e.target.value);
  };

  // function to handle form submit
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // create a new note object with the input value and a random color
    const newNote = {
      id: count.toString(),
      text: input,
      color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 75%)`,
    };
    // update the notes array with the new note
    addNote(count.toString(), newNote);
    increment();
    // clear the input value
    setInput("");
  };

  // function to handle note delete
  const handleDelete = (index: string) => {
    removeNote(index);
  };

  return (
    <LiveSharePage container={container} started={started}>
      <div className="note-container">
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
          <button className="note-button" type="submit">
            Add
          </button>
        </form>
        <div className="notes-container">
          {notes.map((note: any, index) => (
            // render a Note component for each note in the array
            <Note
              key={index}
              index={note.id}
              text={note.text}
              color={note.color}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </LiveSharePage>
  );
};
