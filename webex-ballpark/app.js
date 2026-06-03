fetch('./data/page1.json')
  .then(response => response.json())
  .then(data => {

    document.getElementById('title').textContent = data.title;
    document.getElementById('subtitle').textContent = data.subtitle;
    document.getElementById('interval').textContent = data.interval;

    document.getElementById('callsPresented').textContent =
      data.summary.callsPresented;

    document.getElementById('callsHandled').textContent =
      data.summary.callsHandled;

    document.getElementById('avgQueueTime').textContent =
      data.summary.avgQueueTime;

    document.getElementById('serviceLevel').textContent =
      data.summary.serviceLevel + '%';

    //
    // Queue Standings
    //
    const queueBody =
      document.getElementById('queueStandingsBody');

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

    //
    // Bullpen Report
    //
    const bullpenContainer =
      document.getElementById('bullpenReport');

    data.bullpenReport.forEach(status => {

      const card = document.createElement('div');

      card.className = 'agent-card';

      card.innerHTML = `
        <div class="agent-label">${status.status}</div>
        <div class="agent-value">${status.count}</div>
      `;

      bullpenContainer.appendChild(card);

    });

    //
    // Footer
    //
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
