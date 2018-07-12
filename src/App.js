import React, { Component } from 'react'
import './App.css'
import Toolbar from './Toolbar.js'
import MessageList from './MessageList'
import ComposeForm from './ComposeForm'


const API = 'http://localhost:8082/api/messages'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      compose: false
    }
  }

  async componentDidMount() {
    const response = await fetch(API)
    const data = await response.json()
    this.setState({messages: data})
  }

  setMessages = async(id, command, value, prop) => {
    let obj = {
      messageIds: id,
      command: command,
      [prop]: value
    }
    const response = await fetch(API, {
        method: 'PATCH',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    const messages = await response.json()
    this.setState({messages: messages})
  }

  filterMessage = terms => {
     return this.state.messages.filter(terms)
  }

  selectAll = () => {
    const value = this.allSelected() ? false : true
    const change = this.filterMessage(message => message.selected !== value)
    .map(message => message.id)
    this.setMessages(change, 'selected', value, 'selected')
    this.someSelected()
  }

  allSelected = () => {
    let value = false
    const check = this.filterMessage(message => message.selected === true)
    value = check.length === this.state.messages.length ? true : false
    return value
  }

  someSelected = () => {
    let value = false
    const check = this.filterMessage(message => message.selected === true)
    value = check.length > 0 ? true : false
    return value
  }

  delete = () => {
    const deleteMessageIds = this.filterMessage(message => message.selected).map(message => message.id)
    this.someSelected()
    this.setMessages(deleteMessageIds, 'delete')
  }

  checkbox = id => {
    const select = this.filterMessage(message => message.id === id)[0]
    const value = select.selected ? select.selected = false : select.selected = true
    this.setMessages([id], 'selected', value, 'selected')
    this.allSelected()
    this.someSelected()
  }

  star = id => {
    const message = this.filterMessage(message => message.id === id)
    const value = message[0].starred ? message[0].starred = false : message[0].starred = true
    this.setMessages([id], 'star', value, 'starred')
  }

  unreadCount = () => {
    const unreadCount = this.filterMessage(message => message.read === false)
    return unreadCount.length
  }

  read = value => {
    const ids = []
    const message = this.filterMessage(message => message.selected === true)
    message.map(message => {
      ids.push(message.id)
      return message.read = value
    })
    this.setMessages(ids, 'read', value, 'read')
  }

  label = (value, e) => {
    const messages = this.filterMessage(message => message.selected === true)
    if (value === 'apply'){
      const unlabeled = messages.filter(message => !message.labels.includes(e.target.value))
      const ids = unlabeled.map(message => message.id)
      this.setMessages(ids, 'addLabel', e.target.value, 'label')
    } else if (value === 'remove'){
      const labeled = messages.filter(message =>
        message.labels.includes(e.target.value))
      const ids = labeled.map(message => message.id)
      this.setMessages(ids, 'removeLabel', e.target.value, 'label')
    }
  }

  composeForm = () => {
    this.setState({compose: this.state.compose ? false : true})
  }

  composeMessage = async(e) => {
    e.preventDefault()
    console.log('subject', this.state.subject, 'body', this.state.body)
    const obj = {
      subject: this.state.subject,
      body: this.state.body
    }
    const response = await fetch(API, {
        method: 'post',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    const messages = await response.json()
    this.setState({messages: [...this.state.messages, messages]})
    this.composeForm()
  }

  handleFormChange = e => {
    const target = e.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }

  render() {
    return (
      <div className="App">
        <Toolbar
          read={ this.read }
          label={ this.label }
          deleteMessage={ this.delete }
          unreadCount={ this.unreadCount }
          selectAll={ this.selectAll }
          allSelected={ this.allSelected }
          someSelected={ this.someSelected }
          composeForm={ this.composeForm }
        />
        {this.state.compose ?
          <ComposeForm
            composeMessage={ this.composeMessage }
            handleFormChange={ this.handleFormChange }
          />
          : <div></div>
        }
        <MessageList
          messages={ this.state.messages }
          checkbox={ this.checkbox }
          star={ this.star }
        />
      </div>
    );
  }
}

export default App;
