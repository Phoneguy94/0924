fetch('./data/page1.json')
  .then(response => response.json())
  .then(data => {
    document.getElementById('title').textContent = data.title;
    document.getElementById('subtitle').textContent = data.subtitle;
    document.getElementById('interval').textContent = data.interval;

    document.getElementById('callsPresented').textContent = data.summary.callsPresented;
    document.getElementById('callsHandled').textContent = data.summary.callsHandled;
    document.getElementById('avgQueueTime').textContent = data.summary.avgQueueTime;
    document.getElementById('serviceLevel').textContent = data.summary.serviceLevel + '%';

    document.getElementById('source').textContent =
      data.source.system + ' — ' + data.source.reports.join(', ');

    document.getElementById('refreshMode').textContent = data.source.refreshMode;
  })
  .catch(error => {
    console.error('Error loading dashboard data:', error);
  });
