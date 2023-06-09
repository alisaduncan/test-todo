// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';

import { Route, Routes } from 'react-router-dom';
import Todo from './components/todolist';
import Home from './components/home';
import Toolbar from './components/toolbar';
import AuthContextProvider from './components/authState';

export const App = () => {

  return (
    <div className="m-3">
      <AuthContextProvider>
      <Toolbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/todo" element={<Todo />} />
        </Routes>
      </main>
      </AuthContextProvider>
    </div>
  );
}

export default App;
