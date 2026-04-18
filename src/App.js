import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { getFormResponseUrl, gfEntries, gfFbzx, isGoogleFormConfigured } from './googleFormConfig';
import { submitToGoogleForm } from './submitToGoogleForm';

const RSVP_ATTENDING = ['Да', 'Нет'];
const RSVP_PLUS_ONE = ['Да', 'Нет'];
const RSVP_TRANSFER = ['Нет', 'Да, до места', 'Да, до места и обратно'];
const RSVP_MENU = ['Стандарт', 'Вегитарианское', 'Есть аллргия'];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const createHeart = (index, spawnNow = false) => {
  const isUp = Math.random() > 0.5;

  return {
    id: index,
    mode: isUp ? 'heart-up' : 'heart-float',
    style: {
      '--heart-top': `${randomBetween(8, 84).toFixed(2)}%`,
      '--heart-left': `${randomBetween(6, 92).toFixed(2)}%`,
      '--heart-size': `${randomBetween(8, 18).toFixed(2)}px`,
      '--heart-opacity': randomBetween(0.22, 0.56).toFixed(2),
      '--heart-duration': `${randomBetween(14, 26).toFixed(2)}s`,
      '--heart-delay': spawnNow ? '0s' : `${-randomBetween(0, 18).toFixed(2)}s`,
      '--heart-drift-x': `${randomBetween(-18, 18).toFixed(2)}px`,
    },
  };
};

const createHearts = (count) => Array.from({ length: count }, (_, index) => createHeart(index));

function App() {
  const [heartCount, setHeartCount] = useState(16);
  const [hearts, setHearts] = useState(() => createHearts(16));
  const [rsvp, setRsvp] = useState({
    fullName: '',
    attending: '',
    plusOne: '',
    transfer: '',
    menu: '',
    comment: '',
  });
  const [rsvpError, setRsvpError] = useState('');
  const [rsvpSent, setRsvpSent] = useState(false);
  const weddingDate = useMemo(() => new Date('2026-08-28T15:00:00+03:00'), []);

  const daysLeft = useMemo(() => {
    const msLeft = weddingDate.getTime() - Date.now();
    if (msLeft <= 0) {
      return 0;
    }

    return Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  }, [weddingDate]);

  useEffect(() => {
    const revealedItems = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );

    revealedItems.forEach((item) => observer.observe(item));

    return () => {
      revealedItems.forEach((item) => observer.unobserve(item));
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const setResponsiveHeartCount = () => {
      if (window.matchMedia('(max-width: 680px)').matches) {
        setHeartCount(8);
        return;
      }

      if (window.matchMedia('(max-width: 1024px)').matches) {
        setHeartCount(12);
        return;
      }

      setHeartCount(16);
    };

    setResponsiveHeartCount();
    window.addEventListener('resize', setResponsiveHeartCount);

    return () => {
      window.removeEventListener('resize', setResponsiveHeartCount);
    };
  }, []);

  useEffect(() => {
    setHearts(createHearts(heartCount));
  }, [heartCount]);

  const handleRsvpChange = (field, value) => {
    setRsvp((prev) => ({ ...prev, [field]: value }));
    setRsvpError('');
    setRsvpSent(false);
  };

  const handleRsvpSubmit = (event) => {
    event.preventDefault();
    setRsvpError('');

    if (!isGoogleFormConfigured()) {
      setRsvpError(
        'Отправка не настроена. Запускайте проект из папки wendenig_one или задайте переменные в .env (см. src/googleFormConfig.js).'
      );
      return;
    }

    const actionUrl = getFormResponseUrl();

    if (!rsvp.fullName.trim()) {
      setRsvpError('Укажите имя и фамилию.');
      return;
    }

    if (!rsvp.attending || !rsvp.plusOne || !rsvp.transfer || !rsvp.menu) {
      setRsvpError('Ответьте на все вопросы с вариантами.');
      return;
    }

    submitToGoogleForm({
      actionUrl,
      fbzx: gfFbzx,
      fields: {
        [gfEntries.name]: rsvp.fullName.trim(),
        [gfEntries.attending]: rsvp.attending,
        [gfEntries.plusOne]: rsvp.plusOne,
        [gfEntries.transfer]: rsvp.transfer,
        [gfEntries.menu]: rsvp.menu,
        ...(rsvp.comment.trim() ? { [gfEntries.comment]: rsvp.comment.trim() } : {}),
      },
      onDone: () => {
        setRsvpSent(true);
      },
    });
  };

  return (
    <main className="invite">
      <section className="hero">
        <div className="hero-layer hero-bg" />
        <div className="hero-layer hero-grain" />
        <div className="hero-content">
          <p className="eyebrow">Свадебное приглашение 2026</p>
          <h1>Владислав & Яна</h1>
          <p className="hero-subtitle">
            С огромной радостью приглашаем вас разделить с нами самый важный день нашей жизни.
          </p>
          <div className="hero-date">28 августа 2026 · Zlata VILLA</div>
          <div className="countdown">До свадьбы осталось: {daysLeft} дней</div>
          <a
            className="map-link"
            href="https://yandex.by/maps/29630/minsk-district/house/Zk4YfgVgTUEAQFtufX10eH9kbQ==/inside/?ll=27.820447%2C54.159379&tab=inside&z=17"
            target="_blank"
            rel="noreferrer"
          >
            Открыть маршрут на карте
          </a>
        </div>
        {hearts.map((heart) => (
          <span key={heart.id} aria-hidden="true" className={`heart ${heart.mode}`} style={heart.style} />
        ))}
      </section>

      <section className="section details reveal">
        <div className="card">
          <h2>Церемония</h2>
          <p>15:00 · Zlata VILLA</p>
          <span className="hint">д. Силичи, Полевая улица, 5</span>
        </div>
        <div className="card">
          <h2>Праздничный ужин</h2>
          <p>17:30 · Банкетный зал Zlata VILLA</p>
          <span className="hint">Живая музыка, фотозона, танцы</span>
        </div>
        <div className="card">
          <h2>Dress code</h2>
          <p>Elegant Evening</p>
          <span className="hint">Пастельные и природные благородные тона</span>
        </div>
      </section>

      <section className="section timeline-wrap reveal">
        <h2>План дня</h2>
        <div className="timeline">
          <article>
            <span>14:30</span>
            <p>Сбор гостей и welcome drink</p>
          </article>
          <article>
            <span>15:00</span>
            <p>Торжественная регистрация брака</p>
          </article>
          <article>
            <span>16:30</span>
            <p>Прогулка и фотосессия</p>
          </article>
          <article>
            <span>18:00</span>
            <p>Ужин, тосты и первый танец</p>
          </article>
          <article>
            <span>22:30</span>
            <p>Торт, вечеринка и финальный салют</p>
          </article>
        </div>
      </section>

      <section className="section rsvp reveal">
        <h2>Будем счастливы видеть вас</h2>
        <p>Пожалуйста, подтвердите присутствие до 20 июля 2026 года.</p>

        {!isGoogleFormConfigured() && (
          <p className="rsvp-config-hint">
            Не подтянулись настройки: запускайте <code className="inline-code">yarn start</code> из папки{' '}
            <code className="inline-code">wendenig_one</code> или скопируйте{' '}
            <code className="inline-code">.env.example</code> в <code className="inline-code">.env</code>. При
            ошибке 400 при отправке обновите <code className="inline-code">REACT_APP_GF_FBZX</code> из поля{' '}
            <code className="inline-code">fbzx</code> на странице формы.
          </p>
        )}

        <form className="rsvp-form" onSubmit={handleRsvpSubmit} noValidate>
          <label className="field">
            <span className="field-label">Ваше имя и фамилия</span>
            <input
              type="text"
              name="fullName"
              value={rsvp.fullName}
              onChange={(e) => handleRsvpChange('fullName', e.target.value)}
              autoComplete="name"
              placeholder="Например, Иван Петров"
            />
          </label>

          <fieldset className="fieldset">
            <legend className="field-label">Идёте на праздник?</legend>
            <div className="radio-row">
              {RSVP_ATTENDING.map((opt) => (
                <label key={opt} className="radio">
                  <input
                    type="radio"
                    name="attending"
                    value={opt}
                    checked={rsvp.attending === opt}
                    onChange={() => handleRsvpChange('attending', opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="field-label">С вами будет +1 (кроме детей)?</legend>
            <div className="radio-row">
              {RSVP_PLUS_ONE.map((opt) => (
                <label key={opt} className="radio">
                  <input
                    type="radio"
                    name="plusOne"
                    value={opt}
                    checked={rsvp.plusOne === opt}
                    onChange={() => handleRsvpChange('plusOne', opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="field-label">Нужен ли вам трансфер?</legend>
            <div className="radio-col">
              {RSVP_TRANSFER.map((opt) => (
                <label key={opt} className="radio">
                  <input
                    type="radio"
                    name="transfer"
                    value={opt}
                    checked={rsvp.transfer === opt}
                    onChange={() => handleRsvpChange('transfer', opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="field-label">Предпочтение в меню</legend>
            <div className="radio-col">
              {RSVP_MENU.map((opt) => (
                <label key={opt} className="radio">
                  <input
                    type="radio"
                    name="menu"
                    value={opt}
                    checked={rsvp.menu === opt}
                    onChange={() => handleRsvpChange('menu', opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span className="field-label">Комментарий</span>
            <textarea
              name="comment"
              value={rsvp.comment}
              onChange={(e) => handleRsvpChange('comment', e.target.value)}
              rows={3}
              placeholder="Пожелания"
            />
          </label>

          {rsvpError && (
            <p className="rsvp-msg rsvp-msg--error" role="alert">
              {rsvpError}
            </p>
          )}
          {rsvpSent && !rsvpError && (
            <div className="rsvp-msg rsvp-msg--ok" role="status">
              <p className="rsvp-msg-line">Спасибо! Ответ отправлен</p>
              <p className="rsvp-msg-line rsvp-msg-line--soft">С нетерпением ждём Вас</p>
            </div>
          )}
          <div className="actions rsvp-actions">
            <button type="submit">Отправить ответ</button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default App;
