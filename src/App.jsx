import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RubiksCubePage from './pages/RubiksCubePage';
import './index.css';

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cube" element={<RubiksCubePage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
