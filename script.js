const DATA_URL = 'data.json';

const ANIMATION_DURATION = 5000;

const COLOR_CLASSES = {
  Purple: 'color-purple',
  Orange: 'color-orange',
  Cyan: 'color-cyan',
  Black: 'color-black'
};


/* -----------------------------------------
   Load Dashboard Data
----------------------------------------- */

async function loadDashboard() {

  try {

    const response = await fetch(
      DATA_URL + '?v=' + Date.now(),
      {
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(
        'Unable to load dashboard data.'
      );
    }

    const data = await response.json();

    renderDashboard(data.stats || []);

  } catch (error) {

    console.error(
      'Dashboard loading error:',
      error
    );

    showError();

  }

}


/* -----------------------------------------
   Render Dashboard
----------------------------------------- */

function renderDashboard(stats) {

  const container =
    document.getElementById('stats-container');

  container.innerHTML = '';

  const activeStats = stats
    .filter(stat => stat.active === true)
    .sort((a, b) => a.order - b.order);

  activeStats.forEach(stat => {

    const card =
      createStatCard(stat);

    container.appendChild(card);

  });

  /*
    Watch cards and start their animation
    when they enter the viewport.
  */
  observeStatCards();

}


/* -----------------------------------------
   Create Individual Card
----------------------------------------- */

function createStatCard(stat) {

  const card =
    document.createElement('div');

  card.className = 'stat-card';

  /*
    Store the final value on the card.
  */
  card.dataset.value = Number(stat.value);


  const label =
    document.createElement('div');

  label.className = 'stat-label';

  label.textContent =
    stat.label;


  const value =
    document.createElement('div');

  value.className =
    'stat-value ' +
    (
      COLOR_CLASSES[stat.color]
      || 'color-black'
    );

  /*
    Start at 1, but DO NOT animate yet.
  */
  value.textContent = '1';


  card.appendChild(label);
  card.appendChild(value);

  return card;

}


/* -----------------------------------------
   Observe Cards
----------------------------------------- */

function observeStatCards() {

  const cards =
    document.querySelectorAll('.stat-card');

  /*
    Trigger when approximately 20% of the
    card becomes visible.
  */
  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            const card =
              entry.target;

            /*
              Prevent the same card from
              animating more than once.
            */
            if (
              card.dataset.animated === 'true'
            ) {
              return;
            }

            card.dataset.animated = 'true';

            const valueElement =
              card.querySelector('.stat-value');

            const target =
              Number(card.dataset.value);

            animateNumber(
              valueElement,
              target
            );

            /*
              Stop observing this card.
            */
            observer.unobserve(card);

          }

        });

      },
      {
        threshold: 0.2
      }
    );


  cards.forEach(card => {

    observer.observe(card);

  });

}


/* -----------------------------------------
   Number Animation
----------------------------------------- */

function animateNumber(element, target) {

  target = Math.round(target);

  /*
    If the final value is 0,
    display 0 directly.
  */
  if (target <= 0) {

    element.textContent = '0';

    return;

  }


  const startValue = 1;

  const startTime =
    performance.now();


  function update(currentTime) {

    const elapsed =
      currentTime - startTime;

    const progress =
      Math.min(
        elapsed / ANIMATION_DURATION,
        1
      );


    /*
      Ease-out animation.
    */
    const easedProgress =
      1 - Math.pow(1 - progress, 3);


    const currentValue =
      Math.floor(
        startValue +
        (target - startValue) *
        easedProgress
      );


    element.textContent =
      currentValue.toLocaleString();


    if (progress < 1) {

      requestAnimationFrame(update);

    } else {

      /*
        Guarantee exact final value.
      */
      element.textContent =
        target.toLocaleString();

    }

  }


  requestAnimationFrame(update);

}


/* -----------------------------------------
   Error Message
----------------------------------------- */

function showError() {

  const container =
    document.getElementById('stats-container');

  container.innerHTML = '';

  const message =
    document.createElement('div');

  message.textContent =
    'Membership statistics are currently unavailable.';

  message.style.textAlign = 'center';
  message.style.padding = '40px';
  message.style.fontSize = '18px';

  container.appendChild(message);

}


/* -----------------------------------------
   Start
----------------------------------------- */

loadDashboard();
