/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { getGithubReposApiMethod } from '../../lib/api/admin';
import { styleTextField } from '../SharedStyles';
import notify from '../../lib/notify';

// Prop types definition
const propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
  onSave: PropTypes.func.isRequired,
};

// Default props
const defaultProps = {
  book: null,
};

class EditBook extends React.Component {
  constructor(props) {
    super(props);

    // Initial state
    this.state = {
      book: props.book || {},
      repos: [],
    };
  }

  async componentDidMount() {
    try {
      // Fetch GitHub repos
      const { repos } = await getGithubReposApiMethod();
      this.setState({ repos });
    } catch (err) {
      console.log(err); // Log error if fetch fails
    }
  }

  // Form submission handler
  onSubmit = (event) => {
    event.preventDefault();
    const { name, price, githubRepo } = this.state.book;

    // Validation checks
    if (!name) {
      notify('Name is required');
      return;
    }

    if (!price) {
      notify('Price is required');
      return;
    }

    if (!githubRepo) {
      notify('Github repo is required');
      return;
    }

    // Save book
    this.props.onSave(this.state.book);
  };

  render() {
    return (
      <div style={{ padding: '10px 45px' }}>
        <form onSubmit={this.onSubmit}>
          <br />
          <div>
            <TextField
              onChange={(event) => {
                this.setState({
                  book: { ...this.state.book, name: event.target.value },
                });
              }}
              value={this.state.book.name}
              type="text"
              label="Book's title"
              style={styleTextField}
            />
          </div>
          <br />
          <br />
          <TextField
            onChange={(event) => {
              this.setState({
                book: { ...this.state.book, price: Number(event.target.value) },
              });
            }}
            value={this.state.book.price}
            type="number"
            label="Book's price"
            className="textFieldInput"
            style={styleTextField}
            step="1"
          />
          <br />
          <br />
          <div>
            <span>Github repo: </span>
            <Select
              value={this.state.book.githubRepo || ''}
              input={<Input />}
              onChange={(event) => {
                event.stopPropagation();
                this.setState({
                  book: { ...this.state.book, githubRepo: event.target.value },
                });
              }}
            >
              <MenuItem value="">
                <em>-- choose github repo --</em>
              </MenuItem>
              {this.state.repos.map((r) => (
                <MenuItem value={r.full_name} key={r.id}>
                  {r.full_name}
                </MenuItem>
              ))}
            </Select>
          </div>
          <br />
          <br />
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
        </form>
      </div>
    );
  }
}

EditBook.propTypes = propTypes;
EditBook.defaultProps = defaultProps;

export default EditBook;
