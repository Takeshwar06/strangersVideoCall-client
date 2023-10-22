import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Lobby from './components/screens/Lobby';
import { SocketProvider } from './components/context/SocketProvider';
import Room from './components/screens/Room';

function App() {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          <Route exact path='/' element={<Lobby />} />
          <Route exact path='/room/:roomId' element={<Room />} />
        </Routes>
      </SocketProvider>
    </Router>
  );
}

export default App;
