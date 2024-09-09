document.addEventListener('DOMContentLoaded', function() {
    const currentTimeElement = document.getElementById('current-time');
    const timezoneList = document.getElementById('timezone-list');
    const timezoneInput = document.getElementById('timezone-input');
    const timezoneOptions = document.getElementById('timezone-options');
    const addTimezoneBtn = document.getElementById('add-timezone-btn');

    const popularTimezones = [
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo',
        'Australia/Sydney'
    ];

    function updateCurrentTime() {
        const now = moment();
        currentTimeElement.textContent = `Current Time: ${now.format('YYYY-MM-DD HH:mm:ss')} (${now.format('Z')})`;
    }

    function addTimezone(timezone) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${timezone}</span>
            <span class="time"></span>
        `;
        timezoneList.appendChild(li);
        updateTimezones();
    }

    function updateTimezones() {
        const timezones = timezoneList.querySelectorAll('li');
        timezones.forEach(li => {
            const timezone = li.querySelector('span').textContent;
            const timeElement = li.querySelector('.time');
            const time = moment().tz(timezone);
            timeElement.textContent = time.format('YYYY-MM-DD HH:mm:ss');
        });
    }

    function populateTimezoneOptions() {
        const timezones = moment.tz.names();
        timezones.forEach(timezone => {
            const option = document.createElement('option');
            option.value = timezone;
            timezoneOptions.appendChild(option);
        });
    }

    addTimezoneBtn.addEventListener('click', function() {
        const newTimezone = timezoneInput.value.trim();
        if (newTimezone && moment.tz.zone(newTimezone)) {
            addTimezone(newTimezone);
            timezoneInput.value = '';
        } else {
            alert('Please enter a valid timezone from the list.');
        }
    });

    // Initialize popular timezones
    popularTimezones.forEach(addTimezone);

    // Populate timezone options
    populateTimezoneOptions();

    // Update time every second
    setInterval(() => {
        updateCurrentTime();
        updateTimezones();
    }, 1000);

    // Initial update
    updateCurrentTime();
    updateTimezones();
});
