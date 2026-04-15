import AxisBackground from "./components/AxisBackground";
import Chat from "./components/Chat";

function App() {
  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      
      {/* Background UI (Axis-like) */}
      <AxisBackground />

      {/* Chatbot Overlay */}
      <div
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          width: "350px",
          height: "500px",
          zIndex: 9999,
        }}
      >
        <Chat />
      </div>

    </div>
  );
}

export default App;