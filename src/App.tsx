import "./App.css";
import { NoteContainer } from "./components/NoteContainer";
import { useState } from "react";

const App = () => {
  const [submitted, setSubmitted] = useState(false);
  const [inputs, setInputs] = useState({
    apiEndpoint: "",
    meetingJoinUrl: "",
    skypeMri: "",
    userToken: "",
  });
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      {!submitted && (
        <form className="form" onSubmit={handleSubmit}>
          <label>API Endpoint</label>
          <input
            type="url"
            name="apiEndpoint"
            onChange={handleChange}
            required
          />
          <label>Meeting Join URL</label>
          <input
            type="url"
            name="meetingJoinUrl"
            onChange={handleChange}
            required
          />
          <label>Skype MRI</label>
          <input type="text" name="skypeMri" onChange={handleChange} required />
          <label>User Token</label>
          <input
            type="text"
            name="userToken"
            onChange={handleChange}
            required
          />
          <input type="submit" value="Submit" />
        </form>
      )}
      {submitted && <NoteContainer {...inputs} />}
    </div>
  );
};

export default App;
