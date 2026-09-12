import { BrowserRouter, Routes, Route } from 'react-router';

function Home() {
  return (
    <main>
      <h1>Cờ Tướng Online</h1>
      <p>Chào mừng đến với ứng dụng cờ tướng trực tuyến.</p>
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
