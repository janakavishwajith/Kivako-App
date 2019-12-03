import React from 'react';
import {Button, TextField, Grid, Box, Divider, Zoom, Toolbar} from '@material-ui/core'

/**
 * Author: Peter Mlakar
 * 
 * Custom chat library. 
 * Supports rendering chat messages using the Material Ui library.
 * 
 * Expected properties: messages
 * Optional properties: function sendMessage
 * 
 * The messages object should be an array of the following shape:
 * [{
 *  id: 0,
 *  timestamp: new Date(),
 *  text: "This is the first message!"
 *  },...]
 *  Each array entry presents one messgae. If the message has id 0 it will be rendered as if it belongs to the
 *  session user. All other messages with other ids will be rendered as recieved messages.
 */
class Chat extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {messages: props.messages,
                      sendMessageFunction: props.sendMessage,
                      textFieldContent: '',
                      conversationName: props.conversationName,
                      socket: props.socket,
                      roomId: props.roomId,
                      user: props.user};

        this.handleSend = this.handleSend.bind(this);
        this.sendMessageClick = this.sendMessageClick.bind(this);
        this.sendMessageEnter = this.sendMessageEnter.bind(this);

        if (typeof this.state.sendMessageFunction == 'undefined') this.state.sendMessageFunction = this.sendMessage;
        
        this.state.socket.on('message', (data) => 
        {
            console.log('Client', this.state.user, 'recieved message!');
            console.log('Displaying      message    ');
            var messages = this.state.messages;

            messages.push({
                id: data.id,
                timestamp: data.timestamp,
                text: data.text
            });

            this.setState({messages: messages});
        });
    }

    /**
     * Because the contents of the chat window is updated trough 
     * setting new properties of the component, a listener for
     * properties change is required to trigger re-rendering.
     * 
     * @param {*} props
     * @param {*} state 
     */
    static getDerivedStateFromProps(props, state)
    {
        return {messages: props.messages,
                sendMessageFunction: typeof state.sendMessageFunction == 'undefined' ? Chat.sendMessage : state.sendMessageFunction,
                textFieldContent: state.textFieldContent,
                roomId: props.roomId,
                socket: props.socket,
                conversationName: props.conversationName};
    }

    /**
     * Disconnects the clients socket from the message
     * thread when the component is unmounted. This is required
     * when the user changes chat boxes.
     */
    componentWillUnmount()
    {
        this.state.socket.off('message');
    }

    /**
     * handleTextChange function handles the event when the
     * user is typing the message. The contents of the text field is
     * used to update the this.state property textFieldContent.
     * 
     * @param {*} e TextField containing the unfinished message contents. 
     */
    handleTextChange(e)
    {
        this.setState({textFieldContent: e.target.value});
    }

    /**
     * renderMessages renders the message array stored in
     * the state of the Chat component. The rendered components
     * are ChatBubbles.
     */
    renderMessages()
    {
        let bubbles = [];

        this.state.messages.forEach((element, index) => 
        {
            bubbles.push(<ChatBubble key={index} user={this.state.user} message={element}></ChatBubble>);
        });

        return bubbles;
    }

    /**
     * sendMessage function handels the event of sending the message.
     * This function can be overwriten to do custom actions (like server verification etc.).
     * The returned value should be the new chat array.
     * 
     * @param {*} contents The contents of the TextField at the time it is sent.
     * @param {*} messages The current messages array.
     * @param {*} id The id of the user sending the message. Should always be 0.
     */
    sendMessage(contents, messages, id)
    {
        console.log('Sending message...');

        messages.push({
            id: id,
            timestamp: new Date(),
            text: contents
        });

        return messages;
    }

    /**
     * handleSend function updates the current state messages, forcing a re-render of the ui.
     * The message is also sent to the socket io server for processing and emiting to the apropriate
     * client.
     * 
     * @param {*} newMessages The new messages array.
     */
    handleSend(newMessages)
    {
        console.log('Processing post send...emitting to socket.io',newMessages[newMessages.length - 1]);

        this.state.socket.emit('message', {user: this.state.user, roomId: this.state.roomId, message: newMessages[newMessages.length - 1]});

        this.setState({
            messages: newMessages,
            textFieldContent: ''
        });
    }

    /**
     * sendMessageClick processes the action of clicking the send message button.
     * It only sends the message if the textfield contains some non empty string.
     */
    sendMessageClick()
    {
        if (this.state.textFieldContent == '') return;
        this.handleSend(this.state.sendMessageFunction(this.state.textFieldContent, this.state.messages, this.state.user));
    }

    /**
     * sendMessageEnter processes the action of pressing the enter key.
     * It only sends the message if the textfield contains some non empty string.
     */
    sendMessageEnter(event)
    {
        if (event.key == 'Enter' && this.setState.textFieldContent != '') this.handleSend(this.state.sendMessageFunction(this.state.textFieldContent, this.state.messages, this.state.user));
    }

    render()
    {
        return(
            <Box
                boxShadow={3}>
                <Toolbar
                    style={{backgroundColor:'indigo', color:'white'}}>
                {this.state.conversationName}
                </Toolbar>
                {this.renderMessages()}
                <Divider light/>
                <Box
                    p={1} m={0}>
                    <Grid
                        container
                        direction='row'
                        justify='flex-start'
                        alignItems='flex-end'>
                        <Box
                            p={1} m={0}>
                            <Button 
                                variant='contained' 
                                color = 'primary'
                                onClick={() => this.sendMessageClick()}>
                                    Send message
                            </Button>
                        </Box>
                        <Box
                            p={1} m={0}>
                            <TextField 
                                placeholder='Write message here...'
                                onKeyPress={(event) => this.sendMessageEnter(event)}
                                onChange={(e) => this.handleTextChange(e)}
                                value={this.state.textFieldContent}>
                            </TextField>
                        </Box>
                    </Grid>
                </Box>
            </Box>
        )
    }
}

/**
 * The ChatBubble component hold the 
 * text of individual messages and handles the rendering side.
 */
class ChatBubble extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = 
        {
            message: props.message,
            text: props.message.text,
            side: props.message.id == props.user ? 'flex-start' : 'flex-end',
            color: props.message.id == props.user ? '#2073E8' : '#24B8FF',
            align: props.message.id == props.user ? 'left' : 'right'
        };
    }

    static getDerivedStateFromProps(props, oldState)
    {
        var newState =
        {
            message: props.message,
            text: props.message.text,
            side: props.message.id == props.user ? 'flex-start' : 'flex-end',
            color: props.message.id == props.user ? '#2073E8' : '#24B8FF',
            align: props.message.id == props.user ? 'left' : 'right'
        };

        return newState;
    }

    render()
    {
        return(
            <Grid 
                container
                direction='column'
                justify='space-around'
                alignItems={this.state.side}>
                    <Zoom in={true}>
                    <Box 
                        boxShadow={3} 
                        minWidth='10%'
                        minHeight='5%'
                        width='auto'
                        height='auto'
                        component='div'
                        p={2} m={2} 
                        bgcolor={this.state.color}>
                            <p style={{'textAlign': 'center'}}>{this.state.text}</p>
                    </Box>
                    </Zoom>
            </Grid>
        )
    }
}

export default Chat;