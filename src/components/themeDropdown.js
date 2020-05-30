import React from "react"

import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'


export default function ThemeToggle(){
    handleChange = value => {
        this.setState({ theme : value });
        console.log(value);
    }
    return(
        <Dropdown as={ButtonGroup}>
        <Button variant="success">Split Button</Button>

        <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

        <Dropdown.Menu>
        <Dropdown.Item onClick={() => { this.handleChange(1); }} eventKey="1" value='light'>Light</Dropdown.Item>
        <Dropdown.Item onClick={() => { this.handleChange(1); }} eventKey="2" value='dark'>Dark</Dropdown.Item>
        <Dropdown.Item onClick={() => { this.handleChange(1); }} eventKey="3" value='high-contrast'>High Contrast</Dropdown.Item>
        </Dropdown.Menu>
        </Dropdown>
    )
}