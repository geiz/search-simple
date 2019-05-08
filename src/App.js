import React from "react";
//import "./Landing.css";
import PropTypes from "prop-types";
import classNames from "classnames";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import { TextField } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
//icons
import Search from "@material-ui/icons/Search";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AttachMoney from "@material-ui/icons/AttachMoney";

// Suggestion components
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import suggestions from "./suggestions";

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "40%",
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
    flexBasis: "40%",
    flexShrink: 0
  },
  tertiaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
    flexBasis: "20%",
    flexShrink: 0
  },
  container: {
    flexGrow: 1,
    position: "relative",
    minWidth: "300px",
    maxWidth: "500px"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  suggestion: {
    display: "block"
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
});


class Landing extends React.Component {
  // set as a property instead of a method so "this" gets auto binded
  constructor(props) {
    super(props);
    this.state = {
      long: 0,
      lat: 0,
      results: {},
      search: "",
      error: "",
      suggestions: [],
    };
  }

  async getResturantsFromApiAsync(city) {
    try {
      const response = await fetch(`https://opentable.herokuapp.com/api/restaurants?city=${city}`);
      if (!response.ok) {
        this.setState({ error: response.statusText });
      }
      const json = await response.json();
      this.setState({ results: json });
    } catch (error) {
      this.setState({ error: error });
    }
  }

  getResults = () => {
    let savedSearch = this.state.search;
    this.getResturantsFromApiAsync(savedSearch);
  };

  renderInput = inputProps => {
    const { classes, ref, ...other } = inputProps;

    return (
      <TextField
        autoFocus={true}
        fullWidth
        InputProps={{
          inputRef: ref,
          classes: {
            input: classes.input
          },
          ...other
        }}
      />
    );
  };


  //////  START SUGGESTIONS //////
  renderSuggestion = (suggestion, { query, isHighlighted }) => {
    const matches = match(suggestion.label, query);
    const parts = parse(suggestion.label, matches);

    return (
      <MenuItem
        selected={isHighlighted}
        component="div"
        onClick={() => {
          this.setState({search: suggestion.label})
          this.getResults()
        }}
        onKeyDown={() => {
          this.setState({search: suggestion.label})
          this.handleKeyDown()
       }}
      >
        <div>
          {parts.map((part, index) => {
            return part.highlight ? (
              <span key={String(index)} style={{ fontWeight: 500 }}>
                {part.text}
              </span>
            ) : (
              <strong key={String(index)} style={{ fontWeight: 300 }}>
                {part.text}
              </strong>
            );
          })}
        </div>
      </MenuItem>
    );
  };

  renderSuggestionsContainer = options => {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square >
        {children}
      </Paper>
    );
  };

  getSuggestionValue = suggestion => {
    return suggestion.label;
  };

  getSuggestions = value => {
    const inputValue = String(value).trim().toLowerCase();
    const inputLength = inputValue.length;
    let results = [];
    let count = 0;
    if (inputLength === 0) {
      results = [];
    } else {
      for (var i = 0; i < suggestions.length; i++) {
        let matchingIndex = suggestions[i].label.toLowerCase().indexOf(inputValue);
        if (count > 5) {
          // matching 6 results.
          break;
        } else if (matchingIndex > -1) {
          results.push(suggestions[i]);
          count = count + 1;
        } else {
          // Do nothing
        }
      }
    }

    return results;
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  ////// END SUGGESTIONS //////

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleChange2 = (event, { newValue }) => {
    this.setState({
      search: newValue
    });
  };

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.getResults()
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div className="Landing">
        <Typography variant="h5" align="center" color="primary" style={{paddingTop: "2em"}}>Find a Resturant in your City!</Typography>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 10 }}>
        <div style={{ width: "20em" }}>
          <Autosuggest
           onKeyDown={this.handleKeyDown}
            theme={{
              container:
                this.state.width >= 769
                  ? {
                      flexGrow: 1,
                      position: "relative",
                      minWidth: "340px"
                    }
                  : {
                      flexGrow: 1,
                      position: "relative",
                      minWidth: "240px"
                    },
              suggestionsContainerOpen: classes.suggestionsContainerOpen,
              suggestionsList: classes.suggestionsList,
              suggestion: classes.suggestion
            }}
            renderInputComponent={this.renderInput}
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
            renderSuggestionsContainer={this.renderSuggestionsContainer}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            inputProps={{
              classes,
              placeholder: "Seach Cities",
              value: this.state.search,
              onChange: this.handleChange2,
              color: "inherit"
            }}
           
          />
        </div>
          <Button variant="contained" color="primary" onClick={this.getResults} onKeyDown={this.handleKeyDown}className={classes.button}>
            <Search className={classNames(classes.leftIcon, classes.iconSmall)} />
            Search
          </Button>
        </div>

        <div style={{ marginTop: 10, marginRight: 10, marginLeft: 10 }}>
          {this.state.results.total_entries !== undefined ? (
            this.state.results.total_entries < 1 ? (
              <Typography align="center" color="error">No Restaurants Found :(, try searching another area </Typography>
            ) : (
                this.state.results.restaurants.map((el, index) => (
                  <ExpansionPanel key={index} style={{ width: "100%" }}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography className={classes.heading}>{el.name}</Typography>
                      <Typography className={classes.secondaryHeading}>
                        {el.address}, {el.postal_code}
                      </Typography>
                      <Typography className={classes.tertiaryHeading}>{ el.price > 4 ? (<React.Fragment><AttachMoney/><AttachMoney/><AttachMoney/><AttachMoney/><AttachMoney/></React.Fragment>) :
                      el.price > 3 ? (<React.Fragment><AttachMoney/><AttachMoney/><AttachMoney/><AttachMoney/></React.Fragment>) : el.price > 2 ? (<React.Fragment><AttachMoney/><AttachMoney/><AttachMoney/></React.Fragment>) : el.price > 1? (<React.Fragment><AttachMoney/><AttachMoney/></React.Fragment>) : <AttachMoney/>}</Typography>
                    </ExpansionPanelSummary>
                    <div style={{ paddingBottom: "1em", paddingLeft: "3em" }}> 
                      <Typography inline={false} style={{ paddingLeft: "1em" }}>
                        Name: {el.name}
                      </Typography>
                      <Typography inline={false}  style={{ paddingLeft: "1em" }}>
                        Address: {el.address}, {el.city} {el.state}, {el.postal_code}
                      </Typography>
                      <Typography inline={false}  style={{ paddingLeft: "1em" }}>
                        Price: {el.price}/5
                      </Typography>
                      </div>  
                  </ExpansionPanel>
                ))
              )
          ) : (
              <React.Fragment />
            )}
          {this.state.error}
        </div>
      </div>
    );
  }
}

Landing.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Landing);