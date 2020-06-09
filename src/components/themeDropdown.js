import React, { useState } from "react"
import "./style.css"

export default function ThemeButtons() {
    const [show, setShow] = useState(false);
    const [theme, setTheme] = useState("");
    const toggleShow = () => setShow(!show);
  
    window.onclick = e => {
      const targetClass = e.target.className;
      if (targetClass !== "dropbtn") setShow(false);
    };
  
    return (
      <div className={`App${theme && ` ${theme}`}`}>
        <button className="btn">
          <svg style={{ 
            width: `1em`, 
            height: `1em`,
            display: `flex`,
            justifyContent: `center`,
            alignItems: `center`,
          }} 
          viewBox="0 0 64 64">
            <path
              fill="currentColor"
              d="M17 32a15 15 0 1030 0 15 15 0 00-30 0zm28 0a13 13 0 11-26 0 13 13 0 0126 0zM33 12l1-1V1a1 1 0 10-2 0v10l1 1zM49 5h-2l-5 8a1 1 0 002 1l5-8V5zM51 23l9-5a1 1 0 00-1-2l-9 5a1 1 0 001 2zM12 33l-1-1H1a1 1 0 000 2h10l1-1zM4 18l9 5a1 1 0 001 0v-2l-9-5-1 1v1zM21 15l1-2-5-8a1 1 0 10-2 1l5 8 1 1zM33 52l-1 1v10a1 1 0 102 0V53l-1-1zM23 50h-2l-5 9a1 1 0 002 1l5-9v-1zM13 42l-8 5a1 1 0 001 2l8-5a1 1 0 00-1-2zM63 32H53a1 1 0 000 2h10a1 1 0 000-2zM59 47l-8-5a1 1 0 10-1 2l8 5a1 1 0 001 0v-2zM43 50h-2v1l5 9a1 1 0 001 0l1-1-5-9z"
            />
            </svg>
          </button>
        <div className="dropdown">
          <button onClick={toggleShow} className="dropbtn" style={{
            display: `flex`,
            alignItems: `center`,
          }}>
            Theme
            <svg style={{ 
            width: `1em`, 
            height: `1em`,
            display: `flex`,
            justifyContent: `center`,
            alignItems: `center`,
            marginLeft: `.3em`
          }} 
            viewBox="0 0 295 295">
              <path d="M292 215c-2-2-6-2-8 0l-60 59V6a6 6 0 00-12 0v268l-59-59a6 6 0 00-9 8l70 70a6 6 0 008 0l70-70c2-2 2-6 0-8zM7 12h180a6 6 0 000-12H7a6 6 0 000 12z"/>
              <path d="M7 82h180a6 6 0 000-12H7a6 6 0 000 12zM7 152h180a6 6 0 000-12H7a6 6 0 000 12zM124 211H7a6 6 0 000 12h117a6 6 0 000-12zM124 281H7a6 6 0 000 12h117a6 6 0 000-12z"/>
            </svg>
          </button>
          <div id="myDropdown" className={`dropdown-content  ${show && "show"}`}>
            <a onClick={ () => setTheme("")}>Light</a>
            <a onClick={ () => setTheme("dark")}>Dark</a>
            <a onClick={ () => setTheme("high-contrast")}>High Contrast</a>
          </div>
        </div>
      </div>
    );
  }
