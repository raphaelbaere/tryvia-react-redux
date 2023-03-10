import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import Header from '../Components/Header';
import Timer from '../Components/Timer';
import '../style/answersColors.style.css';
import shuffle from '../util/shuffle';
import { setNewScore, setAssertions } from '../redux/actions';
import { Paper } from '@mui/material';

class Game extends Component {
  state = {
    currentQuestion: 0,
    questions: [],
    hasAnswered: false,
    category: '',
    difficulty: '',
    text: '',
    correctAnswer: '',
    shuffledAnswers: [],

    // This property is managed by 'Timer' child component
    timerHandle: {
      startTimer: () => {},
      stopTimer: () => {},
    },
  };

  componentDidMount() {
    const token = localStorage.getItem('token');
    this.getQuestions(token);
  }

  setQuestions = () => {
    const { questions, currentQuestion, timerHandle } = this.state;
    console.log(questions);
    console.log(questions[currentQuestion]);
    const { category, difficulty, question } = questions[currentQuestion];
    const correctAnswer = questions[currentQuestion].correct_answer;
    const incorrectAnswers = questions[currentQuestion].incorrect_answers;

    this.setState({
      category,
      difficulty,
      text: question,
      shuffledAnswers: shuffle([correctAnswer, ...incorrectAnswers]),
      correctAnswer,
      hasAnswered: false,
    });
    timerHandle.startTimer();
  };

  fetchQuestions = async (TOKEN) => {
    const { player: { URL } } = this.props;
    let constructuredURL = `${URL}${TOKEN}`;
    if (URL !== 'https://opentdb.com/api.php?amount=5&token=') constructuredURL = `${URL}`;
    const response = await fetch(constructuredURL);
    const json = await response.json();
    const RESPONSE_CODE_ERROR = 3;
    if (json.response_code === RESPONSE_CODE_ERROR) {
      return false;
    }
    console.log(json);
    return json.results;
  };

  getQuestions = async (token) => {
    const { history } = this.props;
    const response = await this.fetchQuestions(token);

    // If response_code is invalid, return to initial page
    if (!response) history.push('/');

    this.setState({
      questions: response,
    }, this.setQuestions);
  };

  updateScore = ({ target }) => {
    const { player, dispatch } = this.props;
    const { score, timeWhenTimerFinished, assertions } = player;
    const { difficulty } = this.state;
    const buttonTestId = target.getAttribute('data-testid');
    let difficultySum;
    const THREE_POINTS = 3;
    const TEN_POINTS = 10;
    switch (difficulty) {
    case 'easy':
      difficultySum = 1;
      break;
    case 'medium':
      difficultySum = 2;
      break;
    default:
      difficultySum = THREE_POINTS;
      break;
    }
    if (buttonTestId.match(/correct-answer/)) {
      const newScore = score + TEN_POINTS + (timeWhenTimerFinished * difficultySum);
      const newAssertions = assertions + 1;
      dispatch(setNewScore(newScore));
      dispatch(setAssertions(newAssertions));
    }
  };

  triggerAnswer = () => {
    const { timerHandle } = this.state;
    timerHandle.stopTimer();
    this.setState({ hasAnswered: true });
  };

  setTimerStartAndStop = (startTimer, stopTimer) => {
    this.setState((prevState) => ({
      timerHandle: {
        ...prevState.timerHandle,
        startTimer,
        stopTimer,
      },
    }));
  };

  renderShuffledAnswer = () => {
    const { correctAnswer, shuffledAnswers, hasAnswered } = this.state;

    let currentWrongIndex = 0;
    return shuffledAnswers.map((answer) => {
      let dataTestId;
      let eleClass;
      if (answer !== correctAnswer) {
        dataTestId = `wrong-answer-${currentWrongIndex}`;
        eleClass = 'wrong';
        currentWrongIndex += 1;
      } else {
        dataTestId = 'correct-answer';
        eleClass = 'correct';
      }
      return (
        <button
          key={ dataTestId }
          type="button"
          className={ hasAnswered ? eleClass : 'answers' }
          data-testid={ dataTestId }
          onClick={ (e) => {
            this.triggerAnswer();
            this.updateScore(e);
          } }
          disabled={ hasAnswered }
        >
          { answer }
        </button>
      );
    });
  };

  changeQuestion = () => {
    const { currentQuestion } = this.state;
    const { history } = this.props;
    const totalQuestions = 4;
    if (currentQuestion < totalQuestions) {
      this.setState((prevState) => ({
        currentQuestion: prevState.currentQuestion + 1,
      }), this.setQuestions);
    } else {
      history.push('/feedbacks');
    }
  };

  render() {
    const {
      hasAnswered,
      category,
      text,
      currentQuestion,
      questions,
    } = this.state;
    // const { prop1, dispatch } = this.props;
    return (
      <Paper sx={ { marginTop: -5, padding: 3, marginBottom: 2 } }>
        <Header />
        <div id="game-questions">
          <h2 className="current-question" data-testid="current-question">{ 'Question ' + currentQuestion}</h2>
          <Timer
          setTimerStartAndStop={ this.setTimerStartAndStop }
          triggerAnswer={ this.triggerAnswer }
          />
          <h3 className="current-question" data-testid="question-category">{ category }</h3>
          <h3 className="question-text" data-testid="question-text">{ text }</h3>
          <div data-testid="answer-options">
            { this.renderShuffledAnswer() }
          </div>
          {(hasAnswered && currentQuestion < questions.length)
          && (
            <button
              type="button"
              onClick={ this.changeQuestion }
              data-testid="btn-next"
              className="next"
            >
              Next
            </button>)}
        </div>
      </Paper>
    );
  }
}

const mapStateToProps = (state) => ({
  ...state,
});

Game.propTypes = {
  // prop1: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  player: PropTypes.shape({
    score: PropTypes.number.isRequired,
    timeWhenTimerFinished: PropTypes.number.isRequired,
    assertions: PropTypes.number.isRequired,
    URL: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
export default connect(mapStateToProps)(Game);
