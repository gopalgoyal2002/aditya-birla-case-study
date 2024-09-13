import './App.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useEffect,useState } from 'react';
import {
  Navigate,
} from "react-router-dom";
import Home from './Pages/home/home';
import SignIn from './Pages/authPages/signIn/signIn';
import PageNotFound from './Pages/pageNotFound/pageNotFound';
import DocManagement from './Pages/documentManagement/docManagement';
import ChatBot from './Pages/chatBot/chatBot';
import SearchBot from './Pages/chatBot/SearchBot';

function App() {

  const [userData, setUserData] = useState(() => {
    const storedData = localStorage.getItem("access_token");
    return storedData ? JSON.parse(storedData) : null;
  });


  const checkUserData = () => {
    const storedData = localStorage.getItem("access_token");
    if (!storedData) {
      return <Navigate to="/login" />;
    }
    
    setUserData(JSON.parse(storedData));
    return null;
  };
  useEffect(() => {
    const storedData = localStorage.getItem("access_token");
    if (!storedData) {
      // User is not logged in, no need to redirect
      return;
    }
    setUserData(JSON.parse(storedData));
  }, []);

  const PrivateRoute = ({ element }) => {
    return userData ? element : checkUserData();
  };

  return (
    <BrowserRouter>
    <Routes>
    <Route path="/home" element={<PrivateRoute element={<Home />} />}  />
    <Route path="/Document-Management" element={<PrivateRoute element={<DocManagement />} />}  />
    <Route path="/Chat-Bot" element={<PrivateRoute element={<ChatBot />} />}  />
    <Route path="/Document-Retrieval" element={<PrivateRoute element={<SearchBot />} />}  />


    <Route path="/login" element={<SignIn />} />
    <Route path="/" element={<SignIn />} />
    <Route path="/*" element={<PageNotFound />} />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
