import React, { useState } from 'react';
import axios from 'axios';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeOptions, setTimeOptions] = useState(['']);
  const [eventLink, setEventLink] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '500px auto',
      backgroundColor: '#ededed',
      padding: '500px',
      borderRadius: '10px',
    },
    title: {
      fontSize: '35px',
    },
    subtitle: {
      fontSize: '30px',
    },
    form: {
      fontSize: '35px',
    },
    input: {
      width: '100%',
      marginTop: '5px',
      marginBottom: '15px',
      padding: '10px',
      fontSize: '25px',
    },
    button: {
      fontSize: '25px',
      padding: '10px 15px',
      marginRight: '10px',
      cursor: 'pointer',
    },
    timeOption: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
    },
    removeButton: {
      backgroundColor: '#ededed)',
      border: 'none',
      fontSize: '25px',
      padding: '10px 15px',
      cursor: 'pointer',
    },
    errorMessage: {
      color: 'red',
      fontWeight: 'bold',
      marginTop: '10px',
    },
    eventLink: {
      marginTop: '20px',
    },
  };

  const handleTimeChange = (index, value) => {
    const updated = [...timeOptions];
    updated[index] = value;
    setTimeOptions(updated);
  };

  const addTimeOption = () => setTimeOptions([...timeOptions, '']);

  const removeTimeOption = (index) => {
    const updated = [...timeOptions];
    updated.splice(index, 1);
    setTimeOptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || timeOptions.length === 0 || timeOptions.some((time) => !time)) {
      setErrorMessage('All fields (Title, Description, and at least one Time Option) are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/events', {
        title,
        description,
        times: timeOptions.filter(Boolean),
      });

      const eventId = response.data.id;
      setEventLink(`${window.location.origin}/vote/${eventId}`);
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to create event:', error);
      setErrorMessage('An error occurred while creating the event.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Luo tapahtuma</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>
          Otsikko:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <label>
          Tapahtuman Kuvaus:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={styles.input}
          />
        </label>

        <div>
          <h4 style={styles.subtitle}>Aikavaihtoehdot:</h4>
          {timeOptions.map((option, index) => (
            <div key={index} style={styles.timeOption}>
              <input
                type="datetime-local"
                value={option}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => removeTimeOption(index)}
                style={styles.removeButton}
              >
                -
              </button>
            </div>
          ))}
          <button type="button" onClick={addTimeOption} style={styles.button}>
            + Lisää päivämäärä 
          </button>
        </div>

        <button type="submit" style={styles.button}>
        Luo tapahtuma
        </button>
      </form>

      {errorMessage && (
        <div style={styles.errorMessage}>
          <strong>{errorMessage}</strong>
        </div>
      )}

      {eventLink && (
        <div style={styles.eventLink}>
          <strong>Jaa linkki osallistujille:</strong>
          <p>
            <a href={eventLink} target="_blank" rel="noopener noreferrer">
              {eventLink}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default CreateEvent;

