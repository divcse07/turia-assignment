import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Clients from './components/Clients'
import AddClient from './components/AddClient'
import EditClient from './components/EditClient'

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Clients />} />
          <Route path="/clients/add" element={<AddClient />} />
          <Route path="/clients/edit/:id" element={<EditClient />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
