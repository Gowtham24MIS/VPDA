import { useState, useEffect, useRef } from "react";
import MicButton from "./MicButton";
import "../styles/ChatBox.css";
import axios from "axios"; 

function ChatBox() {
  const [message, setMessage] = useState(""); 
  const [messages, setMessages] = useState([]); 
  const [activeTab, setActiveTab] = useState("chat");
  const [meetings, setMeetings] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  // Fetch meetings and reminders from your .NET backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const meetingsRes = await axios.get("http://localhost:5298/api/meetings");
      const remindersRes = await axios.get("http://localhost:5298/api/reminders");
      
      setMeetings(meetingsRes.data || []);
      setReminders(remindersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback empty arrays
      setMeetings([]);
      setReminders([]);
    }
    setLoading(false);
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customMessage = null) => {
    const textToSend = customMessage || message;
  
    if (!textToSend.trim()) return;
  
    const userMessage = textToSend.trim();
    setMessages((prev) => [...prev, { sender: "You", text: userMessage }]);
  
    try {
      const response = await axios.post(
        "http://localhost:5298/api/voice/process",
        { Text: userMessage },
        { headers: { "Content-Type": "application/json" } }
      );
  
      const botReply = response.data.reply;
  
      setMessages((prev) => [...prev, { sender: "VPDA", text: botReply }]);
  
      speakText(botReply);
    } catch (error) {
      console.error(error.response?.data || error);
  
      const errorMessage = "Sorry, I encountered an error!";
      setMessages((prev) => [...prev, { sender: "VPDA", text: errorMessage }]);
      speakText(errorMessage);
    }
  
    setMessage("");
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
// test to speech as the output
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      console.log("Text-to-speech not supported");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  // Opening the websites from the input

  const websiteMap = {
    google: "https://www.google.com",
    youtube: "https://www.youtube.com",
    gmail: "https://mail.google.com",
    facebook: "https://www.facebook.com",
    instagram: "https://www.instagram.com",
    linkedin: "https://www.linkedin.com",
    hub: "https://www.github.com",
    labs: "https://reforming-indominous-ui.vercel.app/"
  };
  
  const handleVoiceCommand = (transcript) => {
    const text = transcript.toLowerCase().trim();
  
    if (text.startsWith("open ")) {
      const siteName = text.replace("open ", "").trim();
  
      if(text == "stop" || text == "stop it" || text == "top speaking" || text == "stop speaking" ){
        window.speechSynthesis.cancel();
      }

      if (websiteMap[siteName]) {
        window.open(websiteMap[siteName], "_blank");
        setMessages((prev) => [
          ...prev,
          { sender: "You", text: transcript },
          { sender: "VPDA", text: `Opening ${siteName}` }
        ]);
        return;
      }
    }
  
    handleSend(transcript);
  };

  // Sidebar navigation handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab !== "chat" && (meetings.length === 0 || reminders.length === 0)) {
      fetchData();
    }
  };

  // Complete Sidebar Component
  const SidebarContent = () => {
    const renderMeetingsContent = () => (
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h3>📅 Meetings ({meetings.length})</h3>
          <button className="refresh-btn" onClick={fetchData} disabled={loading}>
            🔄 {loading ? "..." : "Refresh"}
          </button>
        </div>
        {loading ? (
          <div className="loading">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="empty-state">No meetings found</div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="sidebar-item meeting-item">
              <div className="item-title">{meeting.person}</div>
              <div className="item-time">{meeting.dateTime}</div>
              <div className="item-status">
                {meeting.isCompleted ? '✅ Completed' : '⏳ Pending'}
              </div>
            </div>
          ))
        )}
      </div>
    );

    const renderRemindersContent = () => (
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h3>⏰ Reminders ({reminders.length})</h3>
          <button className="refresh-btn" onClick={fetchData} disabled={loading}>
            🔄 {loading ? "..." : "Refresh"}
          </button>
        </div>
        {loading ? (
          <div className="loading">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="empty-state">No reminders found</div>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.id} className="sidebar-item reminder-item">
              <div className="item-text">{reminder.message}</div>
              <div className="item-time">{reminder.remindAt}</div>
              <div className="item-status">
                {reminder.isCompleted ? '✅ Done' : '⏰ Pending'}
              </div>
            </div>
          ))
        )}
      </div>
    );

    return (
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${activeTab === "meetings" ? "active" : ""}`}
            onClick={() => handleTabClick("meetings")}
          >
            📅 Meetings ({meetings.length})
          </button>
          <button 
            className={`nav-btn ${activeTab === "reminders" ? "active" : ""}`}
            onClick={() => handleTabClick("reminders")}
          >
            ⏰ Reminders ({reminders.length})
          </button>
        </nav>

        <div className="sidebar-content-container">
          {activeTab === "meetings" && renderMeetingsContent()}
          {activeTab === "reminders" && renderRemindersContent()}
        </div>
      </aside>
    );
  };

  return (
    <div className="app-container">
      {/* Fixed Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>🤖 VPDA Voice Assistant</h1>
        </div>
        <div className="header-right">
          <span className="status-indicator"></span>
          <span className="user-status">Online</span>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar */}
        <SidebarContent />

        {/* Main Chat Area */}
        <div className="chat-main">
          <div className="chat-tabs">
            <button 
              className="tab-btn active"
              onClick={() => setActiveTab("chat")}
            >
              💬 Chat
            </button>
          </div>

          {/* Chat Content */}
          <div className="content-area active">
            <div className="chat-container">
              <div className="chat-window" ref={chatWindowRef}>
                {messages.length === 0 ? (
                  <div className="welcome-message">
                    <div className="welcome-icon">💬</div>
                    <p>Let's merge with your habits...</p>
                    <p>Type a message or use the mic!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender === "You" ? "user" : "bot"}`}>
                      <div className="message-bubble">
                        <div className="sender-name">{msg.sender}</div>
                        <div className="message-text">{msg.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="chat-input-container">
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <MicButton onResult={handleVoiceCommand} />
                  <button className="send-btn" onClick={handleSend} disabled={!message.trim()}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
