import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function FinalizeEvent() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(237, 237, 237)',
    minHeight: '100vh',
    fontSize: '15px',
    padding: '2rem',
    margin: 0,
    width: '100vw',
    overflowX: 'hidden',
  };

  const cssStyles = {
    container: {
      maxWidth: '1000px',
      width: '100%',
      padding: '40px',
      background: 'rgb(255, 255, 255)',
      borderRadius: '20px',
      boxShadow: '0 70px 70px rgba(0, 0, 0, 0.2)',
      fontFamily: 'Arial, sans-serif',
    },
    loadingSpinner: {
      textAlign: 'center',
      fontWeight: 'bold',
    },
    errorMessage: {
      color: 'red',
      fontWeight: 'bold',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/events/${eventId}`);
        if (res.status === 404) {
          setError('Event not found. Please check the event ID and try again.');
          setLoading(false);
          return;
        }
        setEvent(res.data);
        setParticipants(res.data.participants);
        setLoading(false);
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event data. Please try again later.');
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleFinalize = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3001/api/events/${eventId}/finalize`, {
        selectedTime,
      });
      setEmailSent(true);
    } catch (err) {
      console.error('Error finalizing event:', err);
      setError('Failed to finalize event. Please try again later.');
    }
  };

  const getMostPopularTime = () => {
    const timeCounts = {};
    participants.forEach((participant) => {
      for (const [time, availability] of Object.entries(participant.availability || {})) {
        if (availability === 'yes') {
          timeCounts[time] = (timeCounts[time] || 0) + 1;
        }
      }
    });
    const mostPopularTimeEntries = Object.entries(timeCounts);
    if (mostPopularTimeEntries.length === 0) return null;
    const mostPopularTime = mostPopularTimeEntries.reduce((a, b) => (a[1] > b[1] ? a : b));
    return mostPopularTime ? mostPopularTime[0] : null;
  };

  const mostPopularTime = getMostPopularTime();

  if (loading) return <div style={cssStyles.loadingSpinner}>lataa...</div>;
  if (emailSent) return <div style={cssStyles.loadingSpinner}>Kutsut on lähetetty.</div>;
  if (error) return <div style={cssStyles.errorMessage}>{error}</div>;

  return (
    <div style={containerStyle}>
      <div style={cssStyles.container}>
        <h2>{event.title}</h2>
        <p>{event.description}</p>

      
        {mostPopularTime ? (
          <div>
            <strong>{new Date(mostPopularTime).toLocaleString()}</strong>
          </div>
        ) : (
          <div></div>
        )}

        <form onSubmit={handleFinalize}>
          <h4>Valitse tapahtuma päivä:</h4>
          {event.times.map((time) => (
            <div key={time}>
              <label>
                <input
                  type="radio"
                  name="finalTime"
                  value={time}
                  checked={selectedTime === time}
                  onChange={() => setSelectedTime(time)}
                  aria-label={`Select ${new Date(time).toLocaleString()} as final time`}
                />
                {new Date(time).toLocaleString()}
              </label>
              <br />
            </div>
          ))}

          <br />
          <button
            type="submit"
            disabled={!selectedTime}
            style={!selectedTime ? cssStyles.buttonDisabled : {}}
          >
         Viimeistele ja lähetä kutsut
          </button>
        </form>

        <h3>osallistuja:</h3>
        <ul>
          {participants.map((participant, index) => (
            <li key={index}>
              {participant.email || 'No email'} –{' '}
              {Object.entries(participant.availability || {}).map(([time, availability]) => (
                <span key={time}>
                  {new Date(time).toLocaleString()}: <strong>{availability === 'yes' ? 'Available' : 'Not Available'}</strong>{' '}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FinalizeEvent;
