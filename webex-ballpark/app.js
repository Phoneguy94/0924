fetch('./data/page1.json?v=' + Date.now())
  .then(response => response.json())
  .then(data => {

    document.getElementById('title').textContent = data.title;
    document.getElementById('subtitle').textContent = data.subtitle;
    document.getElementById('interval').textContent = data.interval;
    document.getElementById('lastUpdated').textContent = data.lastUpdated;

    document.getElementById('callsPresented').textContent =
      data.summary.callsPresented;

    document.getElementById('callsHandled').textContent =
      data.summary.callsHandled;

    document.getElementById('avgQueueTime').textContent =
      data.summary.avgQueueTime;

    document.getElementById('serviceLevel').textContent =
      data.summary.serviceLevel + '%';

    const queueBody = document.getElementById('queueStandingsBody');
    queueBody.innerHTML = '';

    data.queueStandings.forEach(queue => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${queue.queue}</td>
        <td>${queue.callsPresented}</td>
        <td>${queue.callsHandled}</td>
        <td>${queue.avgQueueTime}</td>
      `;

      queueBody.appendChild(row);
    });

    const bullpenContainer = document.getElementById('bullpenReport');
    bullpenContainer.innerHTML = '';

    data.bullpenReport.forEach(status => {
      const card = document.createElement('div');

      card.className = 'agent-card';

      card.innerHTML = `
        <div class="agent-label">${status.status}</div>
        <div class="agent-value">${status.count}</div>
      `;

      bullpenContainer.appendChild(card);
    });

    const activeStates = [
      'available',
      'connected',
      'wrapup',
      'ringing',
      'on-hold',
      'consulting',
      'hold-done'
    ];

    const activeDetails = document.getElementById('activeDetails');
    const inactiveDetails = document.getElementById('inactiveDetails');

    activeDetails.innerHTML = '';
    inactiveDetails.innerHTML = '';

    data.agentStateSummary.forEach(item => {
      const detailRow = document.createElement('div');
      detailRow.className = 'detail-row';

      detailRow.innerHTML = `
        <span>${formatStateName(item.state)}</span>
        <strong>${item.count}</strong>
      `;

      if (activeStates.includes(item.state)) {
        activeDetails.appendChild(detailRow);
      } else {
        inactiveDetails.appendChild(detailRow);
      }
    });

    document.getElementById('source').textContent =
      data.source.system +
      ' — ' +
      data.source.reports.join(', ');

    document.getElementById('refreshMode').textContent =
      data.source.refreshMode;

  })
  .catch(error => {
    console.error('Error loading dashboard data:', error);
  });

function formatStateName(state) {
  const names = {
    'available': 'Available',
    'connected': 'Connected',
    'wrapup': 'Wrap Up',
    'ringing': 'Ringing',
    'on-hold': 'On Hold',
    'consulting': 'Consulting',
    'hold-done': 'Hold Done',
    'idle': 'Idle',
    'logged-out': 'Logged Out'
  };

  return names[state] || state;
}
