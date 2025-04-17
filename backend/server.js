const nodemailer = require('nodemailer');
const ical = require('ical-generator').default;
const express = require('express');
const mongoose = require('mongoose');
const Event = require('./event');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myEventScheduler';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

// Create a new event
app.post('/api/events', async (req, res) => {
  const { title, description, times } = req.body;

  if (!title || !description || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({ message: 'Missing required fields: title, description, or times' });
  }

  try {
    const parsedTimes = times.map(t => new Date(t));
    const newEvent = new Event({ title, description, times: parsedTimes, participants: [] });
    await newEvent.save();
    console.log('New Event Created:', newEvent);
    res.status(201).json({ id: newEvent._id });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// Get event by ID
app.get('/api/events/:eventId', async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID format' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send('Event not found');
    }
    console.log('Event fetched:', event);
    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Finalize the event and send invites
app.post('/api/events/:eventId/finalize', async (req, res) => {
  const { eventId } = req.params;
  const { selectedTime } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID format' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).send('Event not found');
    console.log('Event retrieved for finalizing:', event);

    if (!event.participants || event.participants.length === 0) {
      return res.status(400).json({ message: 'No participants have voted yet.' });
    }

    event.selectedTime = new Date(selectedTime);
    await event.save();
    console.log('Event finalized with selected time:', event.selectedTime);

    for (const participant of event.participants) {
      const cal = ical({
        domain: 'yourdomain.com',
        prodId: '//yourcompany//NONSGML v1.0//EN'
      });

      cal.createEvent({
        start: new Date(selectedTime),
        end: new Date(new Date(selectedTime).getTime() + 60 * 60 * 1000),
        summary: event.title,
        description: event.description,
        location: 'Event Location (Optional)',
        url: `http://localhost:3001/finalize/${eventId}`,
      });

      const icsContent = cal.toString();

      const emailOptions = {
        from: process.env.EMAIL_USER,
        to: participant.email,
        subject: `Event Invitation: ${event.title}`,
        text: `You are invited to the event "${event.title}" scheduled for ${new Date(selectedTime).toLocaleString()}. Please add it to your calendar.`,
        ical: {
          content: icsContent,
          method: 'REQUEST',
        },
      };

      console.log(`Sending email to: ${participant.email}`);

      try {
        await transporter.sendMail(emailOptions);
        console.log(`Invitation sent to ${participant.email}`);
      } catch (err) {
        console.error(`Error sending invitation to ${participant.email}:`, err.message);
        console.error('Full error object:', err);
      }
    }

    res.send({ message: 'Event finalized and invitations sent!' });
  } catch (error) {
    console.error('Error finalizing event:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Vote for event time
app.post('/api/events/:eventId/vote', async (req, res) => {
  const { eventId } = req.params;
  const { availability, email } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ message: 'Invalid event ID format' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const participant = { email, availability };
    event.participants.push(participant);

    await event.save();
    console.log(`Vote submitted for event ${eventId} by participant ${email}`);
    res.status(200).json({ message: 'Vote submitted successfully' });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ message: 'Error submitting vote', error: error.message });
  }
});

// Default route
app.get('/', (req, res) => res.send('Server is running'));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
