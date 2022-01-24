'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-05-27T17:01:17.194Z',
    '2022-01-18T23:36:17.929Z',
    '2022-01-22T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2022-01-20T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// create username for log in
const createUsernames = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};

createUsernames(accounts);

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPass = calcDaysPassed(new Date(), date);
  console.log(daysPass);

  if (daysPass === 0) return 'Today';
  if (daysPass === 1) return 'Yesterday';
  if (daysPass <= 7) return `${daysPass} days ago`;

  const now = new Date();
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  // const locale = navigator.language;
  // console.log(locale);
  return new Intl.DateTimeFormat(locale, options).format(now);
};

// formating numbers
const formatCur = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Display movements
const displayMovements = (arr, sort = false) => {
  containerMovements.innerHTML = '';

  const movSort = sort
    ? arr.movements.slice().sort((a, b) => a - b)
    : arr.movements;

  movSort.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(arr.movementsDates[i]);
    const displayDate = formatMovementDate(date, currentAcoount.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCur(
          mov,
          arr.locale,
          arr.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// display balance
const calcDisplayBalance = acc => {
  const balance = (acc.balance = acc.movements.reduce(
    (acc, mov) => acc + mov,
    0
  ));
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// display summary
const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};
const updateUI = acc => {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

const startLogOutTimer = () => {
  const tick = () => {
    const min = Math.trunc(time / 60);
    const sec = time % 60;
    //in each call, print the remaining time to UI
    labelTimer.textContent = `${String(min).padStart(2, '0')}:${String(
      sec
    ).padStart(2, '0')}`;

    // when 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    //decrease 1s
    time--;
  };

  //set time to 5 minutes
  let time = 100;

  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// event handler
let currentAcoount, timer;

// log in
btnLogin.addEventListener('click', e => {
  // prevent form  from submiting
  e.preventDefault();

  currentAcoount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAcoount?.pin === +inputLoginPin.value) {
    // display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAcoount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    // create current day and time
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAcoount.locale,
      options
    ).format(now);

    //clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // display movements, balance and summary
    updateUI(currentAcoount);
  }
});

// money transfer
btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiveAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiveAccount &&
    currentAcoount.balance >= amount &&
    receiveAccount?.username !== currentAcoount.username
  ) {
    //doing the transfer
    currentAcoount.movements.push(-amount);
    receiveAccount.movements.push(amount);

    //add transfer date
    currentAcoount.movementsDates.push(new Date().toISOString());
    receiveAccount.movementsDates.push(new Date().toISOString());

    // refresh movements, balance and summary
    updateUI(currentAcoount);

    inputTransferAmount.value = inputTransferTo.value = '';
  }

  //timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAcoount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAcoount.movements.push(amount);

      //add transfer date
      currentAcoount.movementsDates.push(new Date().toISOString());
      console.log(currentAcoount);

      // refresh movements, balance and summary
      updateUI(currentAcoount);
    }, 2000);

    inputLoanAmount.value = '';
  }
  //timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

// delete account
btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAcoount.username &&
    +inputClosePin.value === currentAcoount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAcoount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = 'Log in to get started';
});

// sort
let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  console.log(currentAcoount.movements);
  displayMovements(currentAcoount.movements, !sorted);
  sorted = !sorted;
});
