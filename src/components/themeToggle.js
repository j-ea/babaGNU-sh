import React from "react"

import useWindowTheme from "../utils/useWindowTheme"

export default function ThemeToggle({ checked, label, onChange }) {
  const [theme, toggleTheme] = useWindowTheme()
  const id = "theme-toggle"
  const isDarkTheme = theme === "dark"
  const labelText = `Switch to ${isDarkTheme ? "light" : "dark"} theme`
  return (
    <div style={{
      display: `flex`,
    }}>
      <div style={{
      display: `flex`,
      justifyContent: `center`,
      alignItems: `center`,
    }}>
        <input
          id={id}
          type="checkbox"
          style={{ display: `none` }}
          checked={isDarkTheme}
          onChange={toggleTheme}
        />
        <label
          htmlFor={id}
          style={{
            paddingRight: `0.4em`,
            borderTop: `0.2em`,
            cursor: `pointer`,
          }}
          aria-label={labelText}
          title={labelText}
        >
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
        </label>
      </div>
      <div>
        Theme
      </div>
    </div>
  )
}