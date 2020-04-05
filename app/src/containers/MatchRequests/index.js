
import React from 'react';

import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import Divider from '@material-ui/core/Divider';
import Avatar from '@material-ui/core/Avatar';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Icon from '@material-ui/core/Icon';

import logo from '../../tandemlogo.png'
import Grid from '@material-ui/core/Grid'

import { AlertView } from '../../components/AlertView';
import ConstantsList from '../../config_constants';
import UserStyleCard from '../../components/UserStyleCard';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = ({
    root: {
        display: 'inline',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
    },
    gridList: {
        //flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
        width: "auto",
        height: "auto"
    },
    fullWidth: {
        width: "100%",
    },
    bottomMargin: {
        marginBottom: '2em',
    },
    title: {
        color: '#fff',
    },
    titleBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
    preferencesLink: {
        color: '#3f51b5'
    },
    cardContent: {
        padding: '0'
    },
    gridListTileBar: {
        background: "#3f51b5",
    },
    leftText: {
        textAlign: 'left'
    }
});

class MatchRequests extends React.Component {
    constructor(props) 
    {
      super(props);
      this.state = {
        userRequestMatches:[],
        isLoadingPage:true,
        showAlert:false,
        alertType: "success",
        alertText:"",
        portOption:ConstantsList.PORT_IN_USE
      };
      this.acceptMatchRequest = this.acceptMatchRequest.bind(this);
      this.denyMatchRequest = this.denyMatchRequest.bind(this);
      this.toggleAlert = this.toggleAlert.bind(this);
    }

    acceptMatchRequest(match) {
        if (window.confirm("Accept match request?")) {
            fetch(window.location.protocol + '//' + window.location.hostname + this.state.portOption + '/api/v1/usersMatch/acceptMatchRequest/' + match._id,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    cors: 'no-cors',
                    body: JSON.stringify({})
                })
                .then((response) => {
                    if (response.status === 200) {
                        this.toggleAlert(true, "success", "Match request accepted.")
                        this.getUserMatchsRequestListAPI(()=>{this.setState({isLoadingPage: false})});
                    }
                    else
                        this.toggleAlert(true, "error", "Something went wrong.");
                })
                .catch((error) => {
                    console.log('Error');
                    console.error(error);
                });
        }
    }

    denyMatchRequest(match) {
        const url = new URL(window.location.protocol + '//' + window.location.hostname + this.state.portOption + "/api/v1/usersMatch/denyMatchRequest/" + match._id);
            fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                cors: 'no-cors',
            })
            .then((response) => {
                if (response.status == 200) {
                    this.toggleAlert(true, "success", "Match request denied.")
                    this.getUserMatchsRequestListAPI(()=>{this.setState({isLoadingPage: false})});
                }
                else
                    this.toggleAlert(true, "error", "Something went wrong.");
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getUserMatchsRequestListAPI(callback) {
        const url = new URL(window.location.protocol + '//' + window.location.hostname + this.state.portOption + "/api/v1/usersMatch/receiptMatchsRequests");

        fetch(url, {
            method: 'GET',
            credentials: 'include',
            cors: 'no-cors'
        }).then((response) => response.json())
            .then((responseJson) => {
                this.setState({ userRequestMatches: responseJson.userReceiptMatches })
            }).catch((error) => {
                console.error(error);
            });

        callback();
    }


    componentDidMount() {
        this.getUserMatchsRequestListAPI(() => {
            this.setState({ isLoadingPage: false });
        });
    }

    getMatchesTiles(matches, classes) {
        return (
            <div className={classes.fullWidth}>
                <GridList cellHeight="auto" spacing={25} >
                {
                    matches.map((match, key) =>  
                    {
                        return(<GridListTile key={key} rows={2}>
                                    <UserStyleCard  user={match.requesterUser} yesText="Accept" yesFunction={this.acceptMatchRequest} 
                                      noText="Deny" noFunction={this.denyMatchRequest}  page="pending-match" match={match}> 
                                    </UserStyleCard>
                                </GridListTile>)
                    }
                )}
                </GridList>
            </div>   
            )
    }


    toggleAlert(open, type, text) {
        //type is 'error', 'info', 'success', 'warning'
        if (open === true) {
            this.setState({
                showAlert: open,
                alertType: type,
                alertText: text
            })
        }
        else {
            this.setState({
                showAlert: open
            })
        }
    }

    render() {
        const { classes } = this.props;
        const cardStyle = makeStyles(theme => ({
            card: {
                maxWidth: 345,
            },
            media: {
                height: 0,
                paddingTop: '56.25%', // 16:9
            }
        }));

        //Wait until all informations be render until continue
        if (this.state.isLoadingPage) return null;

        if (this.state.userRequestMatches.length === 0) {
            return (
                <div className={classes.root}>
                    <div align="center">
                        <Paper>

                            <br></br>
                            <br></br>
                            <br></br>
                            <br></br>
                            <Typography variant="h5" gutterBottom>
                                No pending requests
                                </Typography>
                            <br></br>
                            <Typography variant="h6" gutterBottom>
                                Click the button below to search for language partners
                                </Typography>
                            <br></br>
                            <Button component={Link} to="/browse-match" variant="contained" color="primary">Search!</Button>
                            <br></br>
                            <br></br>
                        </Paper>
                        <br></br>
                        <br></br>
                        <br></br>
                    </div>
                </div>

            )
        }
        return (
            <div className={classes.root}>
                <ExpansionPanel defaultExpanded={true}>
                        <ExpansionPanelSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                        <Typography variant="h6">
                            Your pending request(s)
                        </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            { 
                                this.getMatchesTiles(this.state.userRequestMatches, classes)
                            }
                            <br></br>
                            <Divider variant="middle" />
                        </ExpansionPanelDetails>
                </ExpansionPanel>
                <AlertView
                    open={this.state.showAlert}
                    variant={this.state.alertType}
                    message={this.state.alertText}
                    onClose={() => { this.setState({ showAlert: false }) }} />
            </div>
        );
    }
}
MatchRequests.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MatchRequests);