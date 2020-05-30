/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import SplitButton from 'react-bootstrap/SplitButton'

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
          <Dropdown as={ButtonGroup}>
          <Button variant="success">Split Button</Button>

          <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

          <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">Light</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Dark</Dropdown.Item>
            <Dropdown.Item href="#/action-3">High Contrast</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  )
}

export default Bio
