
// Thanks to https://github.com/jesseflorig for the idea on how to implement this

import React from "react"

// Given a number of minutes, return a reading time string
export default function ReadTime({ minutes }) {
  const label = ` ${minutes} min read `

  if (minutes < 2) {
    return (
      <span>
        <span role="img" aria-label="A bowl of ice cream">
          🍨
        </span>
         dessert -
        {label}
      </span>
    )
  } else if (minutes < 10) {
    return (
      <span>
        <span role="img" aria-label="Falafel">
          🧆
        </span>
         hors d'oeuvre -
        {label}
      </span>
    )
  } else {
    return (
        <span>
          <span role="img" aria-label="Plate with fork on left and knife on right">
            🍽️
          </span>
           plat principal -
          {label}
        </span>
      )
  }
}