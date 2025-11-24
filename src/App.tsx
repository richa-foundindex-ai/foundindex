import { Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import Results from "@/pages/Results";
import Privacy from "@/pages/Privacy";
import Methodology from "@/pages/Methodology";
import Contact from "@/pages/Contact";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/results" element={<Results />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/methodology" element={<Methodology />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export default App;
