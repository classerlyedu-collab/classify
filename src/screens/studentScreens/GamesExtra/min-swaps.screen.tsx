import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTilesPositionStatus } from "../../../hooks/tile-position-status.hook";
import { UPDATE_GAME_STATUS } from "../../../store/constants";
import { BoardContainer } from "../../../components/studentComponents/GamesExtra/board-container.component";
import { Board } from "../../../components/studentComponents/GamesExtra/board.component";
import { Button } from "../../../components/studentComponents/GamesExtra/button.component";
import { RouteName } from "../../../routes/RouteNames";
import { NavbarGames } from "../../../components";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";

const useSwapsCount = () => {
  const [swapsDone, setSwapsDone] = useState(0);
  const isSwapped = useSelector((state: any) => state.game.swap);

  useEffect(() => {
    if (isSwapped) {
      setSwapsDone((swap) => swap + 1);
    }
  }, [isSwapped]);

  return swapsDone;
};

const useThresholdExceeded = (numOfSwaps: any) => {
  const [isThresholdExceeded, setIsThresholdExceeded] = useState(false);
  const threshold = useSelector(
    (state: any) => state.game.minSwapsMode.threshold
  );

  useEffect(() => {
    if (numOfSwaps > threshold) {
      setIsThresholdExceeded(true);
    }
  }, [numOfSwaps, threshold]);

  return isThresholdExceeded;
};

export const MinSwapsScreen = () => {
  const swapsDone = useSwapsCount();
  const isThresholdExceeded = useThresholdExceeded(swapsDone);
  const threshold = useSelector(
    (state: any) => state.game.minSwapsMode.threshold
  );
  const areTilesAligned = useTilesPositionStatus();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isThresholdExceeded || areTilesAligned) {
      if (areTilesAligned) {
        if (location?.state?._id) {
          Post(`/studentgame/${location?.state?._id}`, {
            score: location?.state?.score,
          })
            .then((d) => {
              if (d.success) {
                displayMessage(d.message, "success");
                navigate(RouteName.GAMES);
              } else {
                displayMessage(d.message, "error");
                navigate(RouteName.GAMES);
              }
            })
            .catch((err) => {
              displayMessage(err.message, "error");
              navigate(RouteName.GAMES);
            });
        } else {
          displayMessage("Error occured! Starts Again", "error");

        }
      }
      dispatch({ type: UPDATE_GAME_STATUS, payload: false });
    } else {
      dispatch({ type: UPDATE_GAME_STATUS, payload: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isThresholdExceeded, areTilesAligned, dispatch]);

  return (
    <>
      <BoardContainer>
        <div className="pt-5 px-4 w-full">
          <NavbarGames
            title={`Solve Puzzle in ${threshold} Swaps or less`}
            route={"/difficulty-level"}
          />
        </div>
        <div
          className={`border-8 border-teal-500 ${
            isThresholdExceeded || areTilesAligned ? "hidden" : "flex"
          }`}
        >
          <Board />
        </div>

        <div className="mt-5 items-center justify-center px-5 w-full h-full">
          {areTilesAligned ? (
            <>
              <h1 className="text-primary" style={{ color: "green" }}>
                All tiles are aligned, You won!😃👍
              </h1>
              <Link to={RouteName.DIFFICULTY_LEVEL}>
                <Button>New Game</Button>
              </Link>
            </>
          ) : isThresholdExceeded ? (
            <>
              <h2 className="text-red-700 mb-8">
                Oops! Max Number of Swaps Exceeded.
              </h2>
              <Link to={RouteName.DIFFICULTY_LEVEL}>
                <button
                  type="button"
                  className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 animate-bounce hover:animate-none focus:animate-ping"
                >
                  Play Again
                </button>
              </Link>
            </>
          ) : (
            <h2 className="text-white">Swaps Done: {swapsDone}</h2>
          )}
        </div>
      </BoardContainer>
    </>
  );
};
