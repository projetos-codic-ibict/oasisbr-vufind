document.addEventListener('DOMContentLoaded', async () => {
  const openClose = document.querySelector('[data-open-close]');
  const tab = document.querySelector('[data-tab="details"]');

  openClose.addEventListener('click', () => {
    const contentElement = document.querySelector('.tab-pane');
    contentElement.classList.toggle('active');
  });


  tab.addEventListener('click', () => {
    tab.classList.toggle('active');
  });
});
