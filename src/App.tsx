import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Catalog from "@/pages/Catalog";
import StandardDetail from "@/pages/StandardDetail";
import Apply from "@/pages/Apply";
import Audit from "@/pages/Audit";
import Reference from "@/pages/Reference";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/standard/:id" element={<StandardDetail />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/reference" element={<Reference />} />
      </Routes>
    </Router>
  );
}
