import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";


import styled from "styled-components";
import { useTilesPositionStatus } from "../../../hooks/tile-position-status.hook";
import { useTimer } from "../../../hooks/timer.hook";
import { UPDATE_GAME_STATUS } from "../../../store/constants";
import { Button } from "../../../components/studentComponents/GamesExtra/button.component";
import { BoardContainer } from "../../../components/studentComponents/GamesExtra/board-container.component";
import { Board } from "../../../components/studentComponents/GamesExtra/board.component";
import { NavbarGames } from "../../../components";
import { RouteName } from "../../../routes/RouteNames";

const formatTime = (time: any) => {
  return `${(parseInt(time / 60 as any, 10) + "").padStart(2, "0")}:${(
    "" +
    (time % 60)
  ).padStart(2, "0")}`;
};

const ErrorText = styled.h2`
  color: white;
  background-color: #f44336;
  padding: 0.5em;
`;

export const TimeLimitScreen = () => {
  const areTilesAligned = useTilesPositionStatus();
  const dispatch = useDispatch();
  const [timeLeft, startTimer, pauseTimer] = useTimer(30); // seconds
  const [isGameStarted, setIsGameStarted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (areTilesAligned || timeLeft === 0 || !isGameStarted) {
      dispatch({ type: UPDATE_GAME_STATUS, payload: false });
      pauseTimer();
    } else {
      dispatch({ type: UPDATE_GAME_STATUS, payload: true });
    }
  }, [timeLeft, areTilesAligned, dispatch, isGameStarted, pauseTimer]);

  const startGame = () => {
    startTimer();
    setIsGameStarted(true);
  };

  return (
    <>
      <BoardContainer>
        <h1 style={{ color: "white" }}>Time Limit Game</h1>
        <div className="w-full px-4" >
          <NavbarGames title={`Time Limit: ${formatTime(timeLeft)}`} route="/difficulty-level" />
        </div>

        <div className="border-8 border-teal-600">
          <Board />
        </div>

        <br />

        {areTilesAligned ? (
          <>
            <h1 style={{ color: "green" }}>Woah! You're a Pro😃👍</h1>
            <Link to={RouteName.DIFFICULTY_LEVEL}>

              <Button>New Game</Button>
            </Link>
          </>
        ) : timeLeft === 0 ? (
          <>
            <ErrorText>Mission Failed, We'll Get 'Em Next Time</ErrorText>
            <Link to={RouteName.DIFFICULTY_LEVEL}>
              <Button>New Game</Button>
            </Link>
          </>
        ) : (
          !isGameStarted && <button
            onClick={startGame}
            type="button" className="text-gray-900 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 focus:animate-ping dark:focus:ring-lime-800 font-medium rounded-lg text-base px-5 py-2.5 text-center me-2 mb-2 animate-pulse hover:animate-none w-3/4 lg:w-1/4">Start Game</button>
        )}
      </BoardContainer>
    </>
  );
};
