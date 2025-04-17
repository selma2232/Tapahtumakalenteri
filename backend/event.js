const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  

  title: { type: String, required: true },
  description: { type: String, required: true },
  times: [{ type: Date, required: true }],
  participants: [
    {
      email: { type: String, required: true },
      availability: { type: Map, of: String } // availability for each time slot
    }
  ],
  selectedTime: { type: Date }, // If the event has a selected time
});

module.exports = mongoose.model('Event', EventSchema);













 
