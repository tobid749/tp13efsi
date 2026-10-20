import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FLAGS_URL = 'https://countriesnow.space/api/v0.1/countries/flag/images';
const CAPITALS_URL = 'https://countriesnow.space/api/v0.1/countries/capital';
const LEADERBOARD_KEY = 'leaderboard';
const ROUND_SECONDS = 15;
const HINT_PENALTY = 2;

const GameContext = createContext(null);

export const normalize = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export function GameProvider({ children }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState('flags'); // 'flags' | 'capitals'
  const [playerName, setPlayerName] = useState('');
  const [playing, setPlaying] = useState(false);

  const [currentCountry, setCurrentCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [revealed, setRevealed] = useState([]); // índices de letras reveladas
  const [options, setOptions] = useState([]); // capitales (modo capitales)
  const [eliminated, setEliminated] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // Trae países + banderas y capitales al montar
  useEffect(() => {
    const load = async () => {
      try {
        const [flagsRes, capsRes] = await Promise.all([
          fetch(FLAGS_URL).then((r) => r.json()),
          fetch(CAPITALS_URL).then((r) => r.json()),
        ]);
        const capitals = {};
        capsRes.data.forEach((c) => {
          if (c.capital) capitals[c.iso2] = c.capital;
        });
        const list = flagsRes.data
          .filter((c) => c.iso2 && c.name)
          .map((c) => ({
            name: c.name.trim(),
            iso2: c.iso2,
            // las banderas de la API son SVG y React Native no los muestra,
            // por eso usamos la versión PNG a partir del código iso2
            flag: `https://flagcdn.com/w640/${c.iso2.toLowerCase()}.png`,
            capital: capitals[c.iso2] || null,
          }));
        setCountries(list);
      } catch (e) {
        setError('No se pudieron cargar los países. Revisá tu conexión.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Ranking persistido
  useEffect(() => {
    AsyncStorage.getItem(LEADERBOARD_KEY)
      .then((raw) => raw && setLeaderboard(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const pickCountry = useCallback(
    (m, previous) => {
      const pool = countries.filter((c) => (m === 'capitals' ? c.capital : true));
      if (pool.length === 0) return;
      let next;
      do {
        next = pool[Math.floor(Math.random() * pool.length)];
      } while (pool.length > 1 && previous && next.iso2 === previous.iso2);

      setCurrentCountry(next);
      setTimeLeft(ROUND_SECONDS);
      setRevealed([]);
      setEliminated([]);
      if (m === 'capitals') {
        const wrong = shuffle(pool.filter((c) => c.capital !== next.capital)).slice(0, 2);
        setOptions(shuffle([next.capital, ...wrong.map((c) => c.capital)]));
      } else {
        setOptions([]);
      }
    },
    [countries]
  );

  const nextCountry = useCallback(() => {
    pickCountry(mode, currentCountry);
  }, [pickCountry, mode, currentCountry]);

  const startGame = (name, selectedMode) => {
    setPlayerName(name.trim());
    setMode(selectedMode);
    setScore(0);
    setFeedback(null);
    setPlaying(true);
    pickCountry(selectedMode, null);
  };

  const resetScore = () => setScore(0);

  const finishGame = async () => {
    if (playerName) {
      const entry = { name: playerName, score, mode, date: Date.now() };
      const updated = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 20);
      setLeaderboard(updated);
      try {
        await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
      } catch (e) {}
    }
    setPlaying(false);
    setCurrentCountry(null);
    setFeedback(null);
  };

  const answer = (isCorrect) => {
    if (isCorrect) {
      const gained = 10 + timeLeft;
      setScore((s) => s + gained);
      setFeedback({ ok: true, text: `¡Correcto! +${gained} (10 + ${timeLeft}s)` });
      nextCountry();
    } else {
      setScore((s) => s - 1);
      setFeedback({ ok: false, text: 'Incorrecto, -1' });
    }
  };

  // Modo banderas: arriesgar el nombre del país
  const guess = (text) => {
    if (!currentCountry || !text.trim()) return;
    answer(normalize(text) === normalize(currentCountry.name));
  };

  // Modo capitales: elegir una de las opciones
  const guessCapital = (option) => {
    if (!currentCountry) return;
    answer(option === currentCountry.capital);
  };

  const eliminateOne = () => {
    if (!currentCountry) return;
    setEliminated((el) => {
      const wrong = options.filter((o) => o !== currentCountry.capital && !el.includes(o));
      if (wrong.length === 0) return el;
      return [...el, wrong[Math.floor(Math.random() * wrong.length)]];
    });
  };

  // Pista a pedido: resta 2s al timer
  const useHint = () => {
    if (!currentCountry) return;
    if (mode === 'flags') {
      const name = currentCountry.name;
      const hidden = [...name]
        .map((ch, i) => i)
        .filter((i) => name[i] !== ' ' && !revealed.includes(i));
      if (hidden.length <= 1) return;
      const pick = hidden[Math.floor(Math.random() * hidden.length)];
      setRevealed((r) => [...r, pick]);
    } else {
      eliminateOne();
    }
    setTimeLeft((t) => Math.max(0, t - HINT_PENALTY));
  };

  // Cuenta regresiva
  useEffect(() => {
    if (!playing || !currentCountry) return;
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [playing, currentCountry]);

  // Se acabó el tiempo: -1 y nueva bandera
  useEffect(() => {
    if (playing && currentCountry && timeLeft === 0) {
      setScore((s) => s - 1);
      setFeedback({ ok: false, text: `¡Tiempo! Era ${currentCountry.name}. -1` });
      nextCountry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Modo capitales: se elimina una opción cada 5 segundos
  useEffect(() => {
    if (playing && mode === 'capitals' && currentCountry) {
      const elapsed = ROUND_SECONDS - timeLeft;
      if (elapsed > 0 && elapsed % 5 === 0 && timeLeft > 0) eliminateOne();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const value = {
    countries, loading, error,
    mode, playerName, playing,
    currentCountry, score, timeLeft, revealed, options, eliminated, feedback,
    leaderboard, ROUND_SECONDS,
    startGame, finishGame, guess, guessCapital, nextCountry, resetScore, useHint,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de un GameProvider');
  return ctx;
};
