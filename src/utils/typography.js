import Typography from "typography"

const typography = new Typography({
  baseFontSize: "16px",
  baseLineHeight: 1.666,
  scaleRatio: 2.2,
  googleFonts: [
    { name: "Verdana", styles: ["400", "700"] },
    { name: "Georgia", styles: ["400", "400i", "700"] },
    { name: "Fira Code", styles: ["400", "700"] },
  ],
  headerFontFamily: ["Verdana", "sans-serif"],
  bodyFontFamily: ["Georgia", "serif"],
  overrideStyles: ({ rhythm }) => ({
    body: {
      color: "rgba(80,27,29,1)",
      backgroundColor: "rgba(173,173,173,1)",
      fontSize: "1.1em"
    },
    /*"h1, h2, h3, h4, h5, h6": {
      textTransform: "uppercase",
    },*/
    h1: {
      color: "rgba(100,72,92,1)",
    },
    "h1 a": {
      color: "rgba(80,27,29,0.7)",
      textDecorationColor: "rgba(100,72,92,.8)",
    },
    "h3 a": {
      color: "rgba(80,27,29,0.8)",
    },
    a: {
      color: "rgba(80,27,29,0.9)",
      textDecorationColor: "rgba(80,27,29,0.3)",
    },
    "h1 a:hover":{
      textDecorationColor: "rgba(100,72,92,1)",
    },
    "a:hover": {
      color: "rgba(80,27,29,1)",
      textDecorationColor: "rgba(80,27,29,0.7)",
    },
    blockquote: {
      marginLeft: 0,
      paddingLeft: rhythm(1),
      borderLeft: ".2em solid currentColor",
      fontStyle: "italic",
    },
    footer: {
      fontSize: "0.8em",
    },
    ".gatsby-highlight": {
      marginBottom: rhythm(1),
    },
    ".gatsby-highlight-code-line": {
      display: "block",
      borderLeft: "0.5em solid #a5e844",
      backgroundColor: "rgba(255,255,255, 0.1)",
      margin: `0 -1em`,
      padding: ".2em 1em 0.2em 0.5em",
    },
    // Dark mode styles
    ".dark": {
      color: "rgba(131,103,123,1)",
      backgroundColor: "rgba(46,17,20,1)",
    },
    ".dark a": {
      color: "rgba(131,103,123,.8)",
      textDecorationColor: "rgba(131,103,123,.8)",
    },
    ".dark a:hover": {
      color: "rgba(131,103,123,.9)",
      textDecorationColor: "rgba(131,103,123,.9)",
    },
  }),
})

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale