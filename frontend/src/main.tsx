import "./index.css"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import ToastContainer from "./components/ui/ToastContainer"
import { useAuthStore } from "./stores/auth"

useAuthStore.getState().initFromStorage()

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <ToastContainer />
  </BrowserRouter>
)
