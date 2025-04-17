import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateEvent from './CreateEvent';  
import VoteEvent from './VoteEvent';  
import FinalizeEvent from './FinalizeEvent';  

function App() {
  return (
    // Only one Router at the top level
  
      <Routes>
        <Route path="/" element={<CreateEvent />} />
        <Route path="/vote/:eventId" element={<VoteEvent />} />
        <Route path="/finalize/:eventId" element={<FinalizeEvent />} />
      </Routes>

  );
}

export default App;
