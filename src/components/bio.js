/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import ThemeButtons from "./themeDropdown"
import { rhythm } from "../utils/typography"
import ThemeToggle from "./themeToggle"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/polyplant.png/" }) {
        childImageSharp {
          fixed(width: 100, height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author
        }
      }
    }
  `)

  const { author } = data.site.siteMetadata
  return (
    <div
      style={{
        fontSize: `1.1em`,
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={"polygonal digital eggplant"}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          //borderRadius: `100%`,
        }}
        /*imgStyle={{
          borderRadius: `50%`,
        }}*/
      />
      <div 
        style={{ 
          //display: `flex`,
          alignItems: `left`,
          //justifyContent: `space-evenly`
        }}>
          Written by <strong>{author}</strong><br/>
          Serving up tasty bytes.
          <ThemeToggle />
          <ThemeButtons />
      </div>
    </div>
  )
}

export default Bio
