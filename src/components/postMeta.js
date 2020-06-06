// Thanks again to https://github.com/jesseflorig

import React from "react"
import ReadTime from "./readTime"

export default function PostMeta({ date, readTime }) {
  return (
    <>
      {date}
      <span style={{ marginLeft: `1.2em` }}>
        <ReadTime minutes={readTime} />
      </span>
    </>
  )
}