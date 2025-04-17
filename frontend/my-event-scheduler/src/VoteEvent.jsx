import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function VoteEvent() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [availability, setAvailability] = useState({});
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/events/${eventId}`);
        if (res.data) {
          setEvent(res.data);
          const initialAvailability = {};
          res.data.times.forEach((time) => {
            initialAvailability[time] = null;
          });
          setAvailability(initialAvailability);
        } else {
          console.error('Event not found!');
        }
      } catch (err) {
        console.error('Error loading event:', err);
      }
    };
    fetchEvent();
  }, [eventId]);

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleVote = async (e) => {
    e.preventDefault();

    if (email && !isValidEmail(email)) {
      alert('Please enter a valid email address!');
      return;
    }

    const selectedVotes = Object.keys(availability).filter((time) => availability[time] !== null);

    if (selectedVotes.length === 0) {
      alert('Please select your availability for at least one time.');
      return;
    }

    try {
      for (const time of selectedVotes) {
        await axios.post(`http://localhost:3001/api/events/${eventId}/vote`, {
          email,
          selectedTime: time,
          vote: availability[time],
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting vote:', err);
      alert('Error submitting vote');
    }
  };

  const handleChange = (time, value) => {
    setAvailability((prev) => ({
      ...prev,
      [time]: value,
    }));
  };

  if (!event) return <div>Ladataan tapahtumaa...</div>;
  if (submitted) return <div>Saatavuus on ilmoitettu.</div>;

  return (
    <div>
      {/* Inline styles */}
      <style>
        {`
       .container {
  max-width: 1000px;
  padding: 100px;
  background: rgb(255, 255, 255);
  border-radius: 100px;
  box-shadow: 0 70px 70px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 100px;
}

p {
  text-align: center;
  margin-bottom: 25px;
  color: rgb(17, 14, 14);
}

form h4 {
  margin-bottom: 15px;
  font-weight: bold;
}

.vote-option {
  margin-bottom: 155px;
  padding: 10px;
  background:  rgb(237, 237, 237);
  border-radius: 8px;
  border: 1px solid rgb(15, 8, 8);
}

.vote-option strong {
  display: block;
  margin-bottom: 5px;
}

label {
  margin-right: 15px;
  font-size: 14px;
}

input[type="email"] {
  display: block;
  margin-top: 8px;
  padding: 8px;
  width: 100%;
  max-width: 400px;
  border-radius: 6px;
  border: 1px solid rgb(32, 23, 23);
}


button[type="submit"] {
  margin-top: 20px;
  padding: 10px 20px;
  background-color:  rgb(237, 237, 237);
  color: black; /* Text is now black */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

button[type="submit"]:hover {
  background-color:   rgb(237, 237, 237);
  color: white; /* Optional: changes to white on hover */
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color:  rgb(237, 237, 237);
}

}

}

        `}
      </style>

      <div className="container">
        <h2>{event.title}</h2>
        <p>{event.description}</p>

        <form onSubmit={handleVote}>
          <h4>Valitse saatavuus:</h4>
          {event.times.map((time) => (
            <div key={time} className="vote-option">
              <strong>{new Date(time).toLocaleString()}</strong><br />
              <label>
                <input
                  type="radio"
                  name={time}
                  value="yes"
                  checked={availability[time] === 'yes'}
                  onChange={() => handleChange(time, 'yes')}
                /> Yes
              </label>{' '}
              <label>
                <input
                  type="radio"
                  name={time}
                  value="no"
                  checked={availability[time] === 'no'}
                  onChange={() => handleChange(time, 'no')}
                /> No
              </label>
            </div>
          ))}

          <label>
           sähköposti (pakollinen):
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <br />
          <button type="submit">lähetä</button>
        </form>
      </div>
    </div>
  );
}

export default VoteEvent;
