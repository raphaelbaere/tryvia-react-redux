import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Timer extends Component {
  state = {
    timer: 30,
    timerId: 0,
  };

  componentDidMount() {
    const FIRST_TIME = true;
    const TIMER_FINISHED = false;
    this.manageParentComponent(FIRST_TIME, TIMER_FINISHED);
  }

  manageParentComponent = (firstTime = false, timerFinishedState) => {
    // Set parent component way of managing 'Timer' component
    // The 'if' is so startTimer function is lifted up only
    // the first time the 'Timer' is rendered.
    // Also, it concentrates all logic that manipulate the father component
    // is this function.
    const { timer } = this.state;
    const { parentSetState } = this.props;

    if (firstTime) {
      parentSetState({
        timerHandle: {
          timerFinished: timerFinishedState,
          timerValueWhenFinished: timer,
          startTimer: this.startTimer,
          stopTimer: this.triggerFinishedTimer,
        },
      });
      return;
    }
    parentSetState((prevState) => (
      {
        timerHandle: {
          ...prevState.timerHandle,
          timerFinished: timerFinishedState,
          timerValueWhenFinished: timer,
        },
      }
    ));
  };

  stopTimer = () => {
    const { timerId } = this.state;
    clearInterval(timerId);
  };

  triggerFinishedTimer = () => {
    this.stopTimer();
    const FIRST_TIME = false;
    const TIMER_FINISHED = true;
    this.manageParentComponent(FIRST_TIME, TIMER_FINISHED);
  };

  decreaseTimer = () => {
    const { timer } = this.state;

    const TIMER_FINISHED = 0;
    if (timer === TIMER_FINISHED) {
      this.triggerFinishedTimer();
      return;
    }

    this.setState((prevState) => ({
      timer: prevState.timer - 1,
    }));
  };

  setTimerInitialState = () => {
    this.setState({
      timer: 30,
    });
    const FIRST_TIME = false;
    const TIMER_FINISHED = false;
    this.manageParentComponent(FIRST_TIME, TIMER_FINISHED);
  };

  startTimer = () => {
    const THREE_SECONDS = 3000;
    const ONE_SECOND = 1000;
    this.setTimerInitialState();

    // Set small delay before starting timer
    setTimeout(() => {
      const timerId = setInterval(this.decreaseTimer, ONE_SECOND);
      this.setState({ timerId });
    }, THREE_SECONDS);
  };

  render() {
    const { timer } = this.state;
    return (
      <div>
        { timer }
      </div>
    );
  }
}

Timer.propTypes = {
  parentSetState: PropTypes.func.isRequired,
};

export default Timer;
