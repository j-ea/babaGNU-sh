<meta charset="UTF-8">
<div style="text-align: center;">
  <span style="font-size: 6em;">
    <a href="https://www.babagnu.sh" role="image" aria-label="eggplant">🍆</a>
  </span>
</div>
<h1 align="center">
  babaGNU.sh
</h1>

The repository contains the code for [babaGNU.sh](https://babagnu.sh). A personal blog about operating systems and their security.


## Upcoming Posts

- The Linux boot process
- The FreeBSD boot process
- Building profiles for Linux memory forensics
- Slick shell escapes and TTY shells

## To Do

- [ ] Add high contrast / magnification mode for low vision / visually impared
- [ ] Add "course" label for "serving" size
- [ ] Add "read time" to template metadata
- [ ] Combine the above two ideas into one clean label (i.e. 2 minute dessert or 15 min. plat principal)
- [ ] Add multi-language support
- [ ] Add search bar
- [ ] Add tags
- [ ] Add "Tea" and "Current OS" to GraphQL

## Code Structure

    .
    ├── content           (Actual contents of the blog)
        ├── assets            (Directory containing additional items used in the site)
        └── blog              (Directory containing blog pages)
    ├── src               (Front-end code directory)
        ├── components        (React.js directory containing front-end code)
        ├── pages             (These pages automatically become paths based on thier file name)
        ├── templates         (Gatsby.js code for programmatically creating blog posts)
        └── utils             (React.js directory containing front-end code)
    ├── static            (Front-end files to not be processed by webpack)
    ├── .gitignore        (Which files git should not track)
    ├── .prettierrc       (Config file for Prettier)
    ├── gatsby-browser.js (customization of default Gatsby settings affecting the browser)
    ├── gatsby-config.js  (Main config for Gatsby. Contains site metadata ang Gatsby plugin info)
    ├── gatsby-node.js    (Customization settings for site build process. Usage of Gatsby Node APIs.)
    ├── LICENSE           (Included MIT license from Gatsby.js)
    ├── package-lock.json (Automatically generated file of exact versions of npm dependencies)
    ├── package.json      (Manifest for Node.js. Contains project metadata and npm dependencies)
    └── README.md         (The file containing this project structure guide)