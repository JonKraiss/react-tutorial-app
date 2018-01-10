import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function HighlightedSquare(props) {
  return (
    <button className="highlighted-square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(row, col, winningSquares) {
    let dataIndex;
    if(row === 0){
      dataIndex = col;
    }
    else if(row === 1){
      dataIndex = col + 3;
    }
    else if (row === 2){
      dataIndex = col + 6;
    }

    if(winningSquares && (winningSquares[0] === dataIndex || winningSquares[1] === dataIndex || winningSquares[2] === dataIndex)){
      return (
        <HighlightedSquare
          key={col}
          value={this.props.squares[dataIndex]}
          onClick={() => this.props.onClick(dataIndex)}
        />
      );
    }
    else{
      return (
        <Square
          key={col}
          value={this.props.squares[dataIndex]}
          onClick={() => this.props.onClick(dataIndex)}
        />
      );
    }
    
  }

  render() {
    let winningSquares = null;
    if(this.props.winResult)
      winningSquares = this.props.winResult.winningSquares;

    let boardRows = [];
    for (var row = 0; row < 3; row++) {
      let rowSquares = [];
      for (var col = 0; col < 3; col++) {
        rowSquares.push(this.renderSquare(row, col, winningSquares));
      }
      boardRows.push(<div key={row} className="board-row">{rowSquares}</div>);
    }

    return (
      <div>{boardRows}</div>
    );
  }
}

class MoveList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isAscending: true
    };
    this.toggleAscendingList = this.toggleAscendingList.bind(this);
  }

  toggleAscendingList(){
    let newValue = !this.state.isAscending;
    this.setState({isAscending: newValue});
  }

  render() {
    const history = this.props.history;
    const highlightedIndex = this.props.step;

    let moves = history.map((step, move) => {
      const desc = move ? step.latestMove : 'Go to game start';

      if (move !== highlightedIndex) {
        return (
          <li key={move}>
            <button onClick={() => this.props.onClick(move)}>{desc}</button>
          </li>
        );
      }
      else {
        return (
          <li key={move}>
            <button onClick={() => this.props.onClick(move)}><strong>{desc}</strong></button>
          </li>
        );
      }
    });

    if(!this.state.isAscending)
      moves.reverse();

    return(
      <div>
        <ul>{moves}</ul>
        <button onClick={this.toggleAscendingList}>Ascending/Descending</button>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          latestMove: null
        }
      ],
      stepNumber: 0,
      xIsNext: true,
    };

    this.jumpTo = this.jumpTo.bind(this);
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          latestMove: convertToLatestMoveString(i, this.state.xIsNext)
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winResult = calculateWinner(current.squares);

    let status;
    if (winResult) {
      status = "Winner: " + winResult.winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winResult={winResult}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <MoveList onClick={this.jumpTo} history={history} step={this.state.stepNumber}/>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningSquares: lines[i].slice()
      };
    }
  }
  return null;
}

function convertToLatestMoveString(index, xIsNext) {
  let latestMoveString = "";
  xIsNext ? latestMoveString = latestMoveString.concat("X: (") : latestMoveString = latestMoveString.concat("O: (")

  // Determine column
  if (index === 0 || index === 3 || index === 6) {
    latestMoveString = latestMoveString.concat('0');
  }
  else if (index === 1 || index === 4 || index === 7) {
    latestMoveString = latestMoveString.concat('1');
  }
  else {
    latestMoveString = latestMoveString.concat('2');
  }

  latestMoveString = latestMoveString.concat(',');

  // Determine row
  if (index < 3) {
    latestMoveString = latestMoveString.concat('0');
  }
  else if (index < 6) {
    latestMoveString = latestMoveString.concat('1');
  }
  else {
    latestMoveString = latestMoveString.concat('2');
  }

  // Finish string and return
  latestMoveString = latestMoveString.concat(')');
  return latestMoveString;
}
