import { CustomProvider } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './App.css';
import { Register, Dashboard, MyChildren, Calendar, Settings, DashboardTeacher, Courses, Students, Feedback, DailyQuizStudent, Games, Lessons, Material, MultiplayerQuiz, QuizConfirmation, SoloQuiz, StudentDashboard, StudentResult, StudentSubjects, StudentTopics, RootSubjects, DailyQuizOverview, AddQuiz, StudentFeedback, StudentDetails, MyQuizzess, UpdateQuiz, QuizzessDetails, ChildResult } from "./screens";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { RouteName } from "./routes/RouteNames";
import { ContextProvider } from "./context/ContextProvider";
import MasterContainer from "./config/index";
import { App as AppContainer } from 'antd';
import { MainMenuScreen } from './screens/studentScreens/GamesExtra/main-menu.screen';
import { ModeSelectScreen } from './screens/studentScreens/GamesExtra/mode-select.screen';
import { DifficultyLevelScreen } from './screens/studentScreens/GamesExtra/difficulty-level.screen';
import { gameModeUrlMap, gameMode } from "./store/constants";
import { MinSwapsScreen } from './screens/studentScreens/GamesExtra/min-swaps.screen';
import { TimeLimitScreen } from './screens/studentScreens/GamesExtra/time-limit.screen';
import { Provider } from 'react-redux';
import store from './store';
import { TeacherFeedback } from './screens/teacherScreens/TeacherFeedback';
import Coupon from './screens/coupon/Coupon';
import SubscriptionPage from './screens/SubscriptionPage';
import SubscriptionGuard from './components/SubscriptionGuard';
// import Coupon from './screens/parentScreens/Calendar/Coupon';




function App() {
  console.log = () => { }
  console.error = () => { }

  console.warn = () => { }

  return (
    <AppContainer>
      <MasterContainer>
        <Provider store={store}>

          <CustomProvider theme="light">
            <ContextProvider>
              <div className="bg-mainBg h-screen flex-row justify-center items-center w-screen overflow-x-hidden">
                <BrowserRouter>
                  <Routes>
                    <Route
                      path={RouteName.AUTH_SCREEN}
                      element={<Register />}
                    />
                    <Route
                      path={RouteName.SUBSCRIPTION}
                      element={<SubscriptionPage />}
                    />
                    <Route
                      path={RouteName.COUPON}
                      element={<Coupon />}
                    />
                    <Route
                      path={RouteName.CREATE_COUPON}
                      element={<Coupon />}
                    />
                    <Route
                      path={RouteName.GET_COUPON}
                      element={<Coupon />}
                    />
                    <Route
                      path={RouteName.DELETE_COUPON}
                      element={<Coupon />}
                    />
                    <Route
                      path={RouteName.USE_COUPON}
                      element={<Coupon />}
                    />
                    <Route
                      path={RouteName.DASHBOARD_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <Dashboard />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.MYCHILDREN_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <MyChildren />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.CHILD_RESULT_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <ChildResult />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.CALENDAR_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <Calendar />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.SETTING_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <Settings />
                        </SubscriptionGuard>
                      }
                    />
                    {/* Teacher */}
                    <Route
                      path={RouteName.DASHBOARD_SCREEN_TEACHER}
                      element={
                        <SubscriptionGuard>
                          <DashboardTeacher />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.MY_QUIZZESS}
                      element={
                        <SubscriptionGuard>
                          <MyQuizzess />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.ADD_QUIZ}
                      element={
                        <SubscriptionGuard>
                          <AddQuiz />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.UPDATE_QUIZ}
                      element={
                        <SubscriptionGuard>
                          <UpdateQuiz />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.STUDENT_DETAILS_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <StudentDetails />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.COURSES_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <Courses />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.STUDENTS_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <Students />
                        </SubscriptionGuard>
                      }
                    />
                    <Route
                      path={RouteName.FEEDBACK_SCREEN}
                      element={
                        <SubscriptionGuard>
                          <Feedback />
                        </SubscriptionGuard>
                      }
                    />

                    {/* Student */}
                    <Route path={RouteName.DASHBOARD_SCREEN_STUDENT} element={<StudentDashboard />} />

                    {/* games start */}
                    <Route path={RouteName.PLAY_GAME} element={<MainMenuScreen />} />
                    <Route path={RouteName.MODE_SELECT} element={<ModeSelectScreen />} />
                    <Route path={RouteName.DIFFICULTY_LEVEL} element={<DifficultyLevelScreen />} />
                    <Route path={gameModeUrlMap[gameMode.minSwaps]} element={<MinSwapsScreen />} />
                    <Route path={gameModeUrlMap[gameMode.timeLimit]} element={<TimeLimitScreen />} />

                    <Route path={RouteName.TEACHER_FEEDBACK} element={<TeacherFeedback />} />

                    <Route path={RouteName.ROOT_SUBJECTS} element={<RootSubjects />} >

                      <Route path={RouteName.STUDENT_FEEDBACK} element={<StudentFeedback />} />


                      <Route path={RouteName.SUBJECTS_SCREEN} element={<StudentSubjects />} />
                      <Route path={RouteName.TOPICS_SUBJECTS} element={<StudentTopics />} />
                      <Route path={RouteName.LESSONS_STUDENT} element={<Lessons />} />
                      <Route path={RouteName.MATERIAL_STUDENT} element={<Material />} />
                      <Route path={RouteName.GAMES} element={<Games />} >

                      </Route>

                      <Route path={RouteName.DAILY_QUIZ_ROOT} element={<DailyQuizOverview />} >
                        <Route path={RouteName.DAILY_QUIZ} element={<DailyQuizStudent />} />
                        <Route path={RouteName.QUIZ_CONFIRMATION} element={<QuizConfirmation />} />
                        <Route path={RouteName.SOLO_QUIZ} element={<SoloQuiz />} />
                        <Route path={RouteName.MULTIPLAYER_QUIZ} element={<MultiplayerQuiz />} />
                      </Route>

                    </Route>

                    <Route path={RouteName.RESULTS_SCREEN} element={<StudentResult />} />
                    <Route path={RouteName.QUIZZESS_DETAILS} element={<QuizzessDetails />} />



                  </Routes>
                </BrowserRouter>
              </div>
            </ContextProvider>
          </CustomProvider >
        </Provider>
      </MasterContainer>
    </AppContainer>

  );
}

export default App;
