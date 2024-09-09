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
            <span class="dst-info"></span>
            <button class="remove-btn">Remove</button>
        `;
        timezoneList.appendChild(li);
        updateTimezones();
        saveTimezone(timezone);

        li.querySelector('.remove-btn').addEventListener('click', function() {
            li.remove();
            removeTimezone(timezone);
        });
    }

    function updateTimezones() {
        const timezones = timezoneList.querySelectorAll('li');
        timezones.forEach(li => {
            const timezone = li.querySelector('span').textContent;
            const timeElement = li.querySelector('.time');
            const dstInfoElement = li.querySelector('.dst-info');
            const time = moment().tz(timezone);
            timeElement.textContent = time.format('YYYY-MM-DD HH:mm:ss');
            
            // Check if the timezone is currently observing DST
            const isDST = time.isDST();
            const dstOffset = time.utcOffset() / 60; // Convert minutes to hours
            
            if (isDST) {
                dstInfoElement.textContent = `DST: Yes (UTC${dstOffset >= 0 ? '+' : ''}${dstOffset})`;
                dstInfoElement.style.color = 'green';
            } else {
                dstInfoElement.textContent = `DST: No (UTC${dstOffset >= 0 ? '+' : ''}${dstOffset})`;
                dstInfoElement.style.color = 'red';
            }
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

    function saveTimezone(timezone) {
        fetch('/save_timezones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timezones: [timezone] })
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('User not authenticated');
            }
            return response.json();
        })
        .then(result => {
            console.log(result.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function removeTimezone(timezone) {
        fetch('/save_timezones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timezones: [], removed: timezone })
        })
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/login';
                throw new Error('User not authenticated');
            }
            return response.json();
        })
        .then(result => {
            console.log(result.message);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function loadTimezones() {
        if (!document.getElementById('timezone-list')) {
            return;
        }
        fetch('/get_timezones')
        .then(response => {
            if (response.status === 401) {
                throw new Error('User not authenticated');
            }
            return response.json();
        })
        .then(timezones => {
            timezoneList.innerHTML = '';
            if (timezones && timezones.length > 0) {
                timezones.forEach(addTimezone);
            } else {
                popularTimezones.forEach(addTimezone);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (error.message !== 'User not authenticated') {
                popularTimezones.forEach(addTimezone);
            }
        });
    }

    if (addTimezoneBtn) {
        addTimezoneBtn.addEventListener('click', function() {
            const newTimezone = timezoneInput.value.trim();
            if (newTimezone && moment.tz.zone(newTimezone)) {
                addTimezone(newTimezone);
                timezoneInput.value = '';
            } else {
                alert('Please enter a valid timezone from the list.');
            }
        });
    }

    populateTimezoneOptions();
    loadTimezones();

    setInterval(() => {
        updateCurrentTime();
        updateTimezones();
    }, 1000);

    updateCurrentTime();
    updateTimezones();
});
