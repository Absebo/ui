import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { generatePassword, getConfig } from '@buttercup/generator';
import { colors } from '../variables';
import { selectElementContents } from '../utils';
import Popover from 'react-popover';
import { Button } from './button';
import { ColoredDigits } from './colored-digits';

const NOOP = () => {};

const StyledPopover = styled(Popover)`
  .Popover-tip {
    fill: ${colors.DARK_SECONDARY};
  }

  .Popover-body {
    display: inline-flex;
    padding: 0;
    flex-direction: column;
  }
`;
const Password = styled(ColoredDigits)`
  .num {
    color: ${colors.BRAND_PRIMARY};
  }
`;

export class GeneratorBase extends Component {
  static propTypes = {
    onGenerate: PropTypes.func.isRequired
  };

  static defaultProps = {
    onGenerate: NOOP
  };

  state = {
    config: getConfig(),
    password: ''
  };

  characterSetEnabled(setName) {
    return (
      this.state.config.randomCharacters.enabledCharacterSets.indexOf(
        setName
      ) >= 0
    );
  }

  componentDidMount() {
    this.generatePassword();
  }

  generatePassword() {
    generatePassword(this.state.config)
      .then(password => {
        this.setState({
          password
        });
      })
      .catch(err => {
        // Errors for no selected character sets and max retries exceeded occur
        // when the user selects too-restrictive options - we don't really care
        // about the error, we just don't generate a password:
        if (err.code !== 'NO_CHARSETS' && err.code !== 'MAX_RETRIES') {
          // If it's some other error, throw it again
          throw err;
        }
      });
  }

  toggleCharacterSet(setName) {
    const currentCharacterSets = [
      ...this.state.config.randomCharacters.enabledCharacterSets
    ];
    const charsetIndex = currentCharacterSets.indexOf(setName);
    if (charsetIndex >= 0) {
      currentCharacterSets.splice(charsetIndex, 1);
    } else {
      currentCharacterSets.push(setName);
    }
    this.setState(
      {
        config: {
          ...this.state.config,
          randomCharacters: {
            ...this.state.config.randomCharacters,
            enabledCharacterSets: currentCharacterSets
          }
        }
      },
      () => {
        this.generatePassword();
      }
    );
  }

  changeLength(e) {
    this.setState(
      {
        config: {
          ...this.state.config,
          randomCharacters: {
            ...this.state.config.randomCharacters,
            length: parseInt(e.target.value, 10)
          }
        }
      },
      () => {
        this.generatePassword();
      }
    );
  }

  changeType(mode) {
    this.setState(
      {
        config: {
          ...this.state.config,
          mode
        }
      },
      () => {
        this.generatePassword();
      }
    );
  }

  onGenerate() {
    const { onGenerate } = this.props;
    if (onGenerate) {
      onGenerate(this.state.password);
    }
  }

  renderBody() {
    return (
      <div className={this.props.className}>
        <pre
          className="password"
          role="content"
          onClick={e => selectElementContents(e.target)}
        >
          <Password value={this.state.password} />
        </pre>
        <div className="types">
          <label>
            <input
              type="radio"
              checked={this.state.config.mode === 'characters'}
              onChange={() => this.changeType('characters')}
            />{' '}
            Characters
          </label>
          <label>
            <input
              type="radio"
              checked={this.state.config.mode === 'words'}
              onChange={() => this.changeType('words')}
            />{' '}
            Words
          </label>
        </div>
        <If condition={this.state.config.mode === 'characters'}>
          <fieldset className="set">
            <legend>Options</legend>
            <label className="rangeLabel">
              <input
                type="range"
                value={this.state.config.randomCharacters.length}
                min="10"
                max="50"
                onChange={e => this.changeLength(e)}
              />
              <span>{this.state.length}</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={this.characterSetEnabled('UPPERCASE')}
                onChange={() => this.toggleCharacterSet('UPPERCASE')}
              />{' '}
              Uppercase Letters
            </label>
            <label>
              <input
                type="checkbox"
                checked={this.characterSetEnabled('LOWERCASE')}
                onChange={() => this.toggleCharacterSet('LOWERCASE')}
              />{' '}
              Lowercase Letters
            </label>
            <label>
              <input
                type="checkbox"
                checked={this.characterSetEnabled('DIGITS')}
                onChange={() => this.toggleCharacterSet('DIGITS')}
              />{' '}
              Digits
            </label>
            <label>
              <input
                type="checkbox"
                checked={this.characterSetEnabled('SPACE')}
                onChange={() => this.toggleCharacterSet('SPACE')}
              />{' '}
              Space
            </label>
            <label>
              <input
                type="checkbox"
                checked={this.characterSetEnabled('UNDERSCORE_DASH')}
                onChange={() => this.toggleCharacterSet('UNDERSCORE_DASH')}
              />{' '}
              Underscore &amp; Dash
            </label>
            <label>
              <input
                type="checkbox"
                checked={this.characterSetEnabled('SYMBOLS')}
                onChange={() => this.toggleCharacterSet('SYMBOLS')}
              />{' '}
              Symbols
            </label>
          </fieldset>
        </If>
        <div className="buttons">
          <Button onClick={() => this.generatePassword()} primary>
            Generate
          </Button>
          <Button onClick={() => this.onGenerate()} dark>
            Use This
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { children, isOpen, className, ...rest } = this.props;
    return (
      <StyledPopover isOpen={isOpen} body={this.renderBody()} {...rest}>
        {children}
      </StyledPopover>
    );
  }
}

export const Generator = styled(GeneratorBase)`
  width: 300px;
  background: ${colors.DARK_SECONDARY};
  padding: 12px;
  color: #fff;
  border-radius: 5px;
  font-weight: 300;

  label {
    display: block;
  }

  .set {
    border-color: ${colors.WHITE_50};
    border-radius: 3px;

    legend {
      text-transform: uppercase;
      padding: 0 6px;
      font-size: 0.8em;
    }
  }

  .password {
    font-size: 0.9rem;
    padding: 6px;
    margin: 0;
    background-color: ${colors.BLACK_25};
    border-radius: 3px;
    overflow: hidden;
    font-weight: 400;
    cursor: copy;
  }

  .rangeLabel {
    display: flex !important;

    span {
      flex: 0;
      background-color: ${colors.BLACK_25};
      padding: 0 3px;
      border-radius: 3px;
      font-family: monospace;
      width: 30px;
      margin-left: 6px;
    }

    input {
      flex: 1;
    }
  }

  .buttons {
    display: flex;
    margin-top: 12px;
    align-items: flex-start;
    flex-direction: row;

    button {
      width: 50%;

      &:first-child {
        margin-right: 6px;
      }
    }
  }

  .types {
    margin: 12px 0;
    font-size: 0.9rem;

    label {
      display: block;
    }

    small {
      color: ${colors.GRAY_DARK};
    }
  }
`;
